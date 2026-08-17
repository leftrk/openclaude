/**
 * leftrk fork: tests for the yadm-synced plaintext config files
 * (~/.openclaude/providers.json and ~/.openclaude/mcp.json).
 */
import { mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'bun:test'

import {
  acquireSharedMutationLock,
  releaseSharedMutationLock,
} from '../test/sharedMutationLock'
import { getGlobalConfig, type ProviderProfile } from './config.js'
import { setClaudeConfigHomeDirForTesting } from './envUtils.js'
import {
  readSyncedMcpJson,
  readSyncedProviders,
  syncedMcpJsonPath,
  syncedProvidersPath,
  writeSyncedMcpJson,
  writeSyncedProviders,
} from './syncedConfigFiles.js'
import {
  addProviderProfile,
  getActiveProviderProfile,
  getProviderProfiles,
} from './providerProfiles.js'

const originalConfigDir = process.env.CLAUDE_CONFIG_DIR

async function withTempConfigDir<T>(fn: () => Promise<T>): Promise<T> {
  await acquireSharedMutationLock('utils/syncedConfigFiles.test.ts')
  let tempDir: string | null = null
  try {
    tempDir = mkdtempSync(join(tmpdir(), 'openclaude-synced-config-test-'))
    setClaudeConfigHomeDirForTesting(tempDir)
    process.env.CLAUDE_CONFIG_DIR = tempDir
    return await fn()
  } finally {
    try {
      if (originalConfigDir === undefined) {
        delete process.env.CLAUDE_CONFIG_DIR
      } else {
        process.env.CLAUDE_CONFIG_DIR = originalConfigDir
      }
      if (tempDir) {
        rmSync(tempDir, { recursive: true, force: true })
      }
      setClaudeConfigHomeDirForTesting(undefined)
    } finally {
      releaseSharedMutationLock()
    }
  }
}

function buildProfile(overrides: Partial<ProviderProfile> = {}): ProviderProfile {
  return {
    id: 'provider_test',
    name: 'Test Provider',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    ...overrides,
  }
}

describe('syncedConfigFiles', () => {
  it('returns null when providers.json is absent', async () => {
    await withTempConfigDir(async () => {
      expect(readSyncedProviders()).toBeNull()
    })
  })

  it('returns null for malformed JSON', async () => {
    await withTempConfigDir(async () => {
      writeFileSync(syncedProvidersPath(), 'not json {', 'utf8')
      expect(readSyncedProviders()).toBeNull()
    })
  })

  it('returns null when profiles is not an array', async () => {
    await withTempConfigDir(async () => {
      writeFileSync(
        syncedProvidersPath(),
        JSON.stringify({ profiles: { nope: true } }),
        'utf8',
      )
      expect(readSyncedProviders()).toBeNull()
    })
  })

  it('roundtrips providers.json including activeProfileId', async () => {
    await withTempConfigDir(async () => {
      const profiles = [buildProfile(), buildProfile({ id: 'provider_two' })]
      writeSyncedProviders({ profiles, activeProfileId: 'provider_two' })
      expect(readSyncedProviders()).toEqual({
        profiles,
        activeProfileId: 'provider_two',
      })
    })
  })

  it('writes providers.json with 0600 permissions', async () => {
    await withTempConfigDir(async () => {
      writeSyncedProviders({ profiles: [] })
      expect(statSync(syncedProvidersPath()).mode & 0o777).toBe(0o600)
    })
  })

  it('roundtrips mcp.json', async () => {
    await withTempConfigDir(async () => {
      const data = {
        mcpServers: {
          mini: { type: 'stdio' as const, command: 'mini-mcp', args: ['--serve'] },
        },
      }
      writeSyncedMcpJson(data)
      expect(readSyncedMcpJson()).toEqual(data)
    })
  })

  it('writes mcp.json with 0600 permissions', async () => {
    await withTempConfigDir(async () => {
      writeSyncedMcpJson({ mcpServers: {} })
      expect(statSync(syncedMcpJsonPath()).mode & 0o777).toBe(0o600)
    })
  })
})

describe('provider profile overlay', () => {
  it('getProviderProfiles prefers providers.json over the embedded config', async () => {
    await withTempConfigDir(async () => {
      const embedded = buildProfile({ id: 'embedded_profile' })
      const synced = buildProfile({ id: 'synced_profile' })
      const config = getGlobalConfig()
      const previous = {
        providerProfiles: config.providerProfiles,
        activeProviderProfileId: config.activeProviderProfileId,
      }
      try {
        config.providerProfiles = [embedded]
        config.activeProviderProfileId = embedded.id
        writeSyncedProviders({ profiles: [synced], activeProfileId: synced.id })

        expect(getProviderProfiles().map(p => p.id)).toEqual(['synced_profile'])
        expect(getActiveProviderProfile()?.id).toBe('synced_profile')
      } finally {
        config.providerProfiles = previous.providerProfiles
        config.activeProviderProfileId = previous.activeProviderProfileId
      }
    })
  })

  it('addProviderProfile writes to providers.json and strips the embedded copy', async () => {
    await withTempConfigDir(async () => {
      const config = getGlobalConfig()
      const previous = {
        providerProfiles: config.providerProfiles,
        activeProviderProfileId: config.activeProviderProfileId,
      }
      try {
        // Embedded state that must be cleared once the synced file takes over.
        config.providerProfiles = [buildProfile({ id: 'embedded_profile' })]
        config.activeProviderProfileId = 'embedded_profile'
        const existing = buildProfile({ id: 'existing_profile' })
        writeSyncedProviders({
          profiles: [existing],
          activeProfileId: existing.id,
        })

        // makeActive:false keeps the current active profile, so no process.env
        // mutation happens in this test.
        const saved = addProviderProfile(
          {
            provider: 'openai',
            name: 'Added',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4o-mini',
          },
          { makeActive: false },
        )
        expect(saved).not.toBeNull()

        const synced = readSyncedProviders()
        expect(synced?.profiles.map(p => p.id)).toEqual([
          'existing_profile',
          saved!.id,
        ])
        expect(synced?.activeProfileId).toBe('existing_profile')

        // Embedded copies are stripped from ~/.openclaude.json state.
        expect(config.providerProfiles).toEqual([])
        expect(config.activeProviderProfileId).toBeUndefined()
      } finally {
        config.providerProfiles = previous.providerProfiles
        config.activeProviderProfileId = previous.activeProviderProfileId
      }
    })
  })
})

describe('mcp.json user-scope overlay', () => {
  it('getMcpConfigsByScope("user") prefers mcp.json over the embedded config', async () => {
    await withTempConfigDir(async () => {
      const { getMcpConfigsByScope } = await import('../services/mcp/config.js')
      const config = getGlobalConfig()
      const previousMcpServers = config.mcpServers
      try {
        config.mcpServers = {
          embedded: { type: 'stdio', command: 'embedded-mcp', args: [] },
        }
        writeSyncedMcpJson({
          mcpServers: {
            synced: { type: 'stdio', command: 'synced-mcp', args: [] },
          },
        })

        const { servers, errors } = getMcpConfigsByScope('user')
        expect(errors).toEqual([])
        expect(Object.keys(servers)).toEqual(['synced'])
        expect(servers.synced).toMatchObject({
          type: 'stdio',
          command: 'synced-mcp',
          scope: 'user',
        })
      } finally {
        config.mcpServers = previousMcpServers
      }
    })
  })

  it('addMcpConfig/removeMcpConfig route user scope to mcp.json', async () => {
    await withTempConfigDir(async () => {
      const { addMcpConfig, removeMcpConfig } = await import(
        '../services/mcp/config.js'
      )
      const config = getGlobalConfig()
      const previousMcpServers = config.mcpServers
      try {
        config.mcpServers = {
          embedded: { type: 'stdio', command: 'embedded-mcp', args: [] },
        }
        writeSyncedMcpJson({
          mcpServers: {
            existing: { type: 'stdio', command: 'existing-mcp', args: [] },
          },
        })

        await addMcpConfig(
          'added',
          { type: 'stdio', command: 'added-mcp', args: [] },
          'user',
        )
        const afterAdd = readSyncedMcpJson()
        expect(Object.keys(afterAdd?.mcpServers ?? {}).sort()).toEqual([
          'added',
          'existing',
        ])
        // The embedded copy in ~/.openclaude.json is untouched.
        expect(Object.keys(config.mcpServers ?? {})).toEqual(['embedded'])

        await removeMcpConfig('existing', 'user')
        const afterRemove = readSyncedMcpJson()
        expect(Object.keys(afterRemove?.mcpServers ?? {})).toEqual(['added'])
      } finally {
        config.mcpServers = previousMcpServers
      }
    })
  })
})
