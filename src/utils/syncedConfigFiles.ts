/**
 * leftrk fork: yadm-synced plaintext config files.
 *
 * Two optional files under the config home are authoritative-when-present:
 *
 * - `providers.json` — `{ profiles: ProviderProfile[], activeProfileId?: string }`.
 *   When it exists, it is the sole store for provider profiles; the
 *   `providerProfiles` / `activeProviderProfileId` fields embedded in
 *   `~/.openclaude.json` are ignored (and cleared on write).
 * - `mcp.json` — `{ mcpServers: { ... } }`, same shape as project `.mcp.json`.
 *   When it exists, it replaces user-scope MCP servers from `~/.openclaude.json`.
 *
 * Plaintext API keys on purpose: these files are meant to be read, hand-edited,
 * and synced across machines via yadm. They are written with mode 0600 only to
 * keep other local users from casual inspection, not as a secrecy boundary.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { logForDebugging } from './debug.js'
import { getClaudeConfigHomeDir } from './envUtils.js'
import type { ProviderProfile } from './config.js'
import type { McpServerConfig } from '../services/mcp/types.js'

export type SyncedProvidersFile = {
  profiles: ProviderProfile[]
  activeProfileId?: string
}

export type SyncedMcpFile = {
  mcpServers?: Record<string, McpServerConfig>
}

export function syncedProvidersPath(): string {
  return join(getClaudeConfigHomeDir(), 'providers.json')
}

export function syncedMcpJsonPath(): string {
  return join(getClaudeConfigHomeDir(), 'mcp.json')
}

export function syncedProvidersExists(): boolean {
  return existsSync(syncedProvidersPath())
}

export function syncedMcpJsonExists(): boolean {
  return existsSync(syncedMcpJsonPath())
}

/** Raw read: returns null when absent, malformed, or wrong shape. */
export function readSyncedProviders(): SyncedProvidersFile | null {
  const path = syncedProvidersPath()
  if (!existsSync(path)) {
    return null
  }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<SyncedProvidersFile>
    if (!Array.isArray(parsed.profiles)) {
      logForDebugging(`Ignoring ${path}: missing "profiles" array`, { level: 'warn' })
      return null
    }
    return {
      profiles: parsed.profiles,
      activeProfileId:
        typeof parsed.activeProfileId === 'string' ? parsed.activeProfileId : undefined,
    }
  } catch (error) {
    logForDebugging(`Ignoring ${path}: ${error}`, { level: 'warn' })
    return null
  }
}

/** Raw read without validation/expansion; write sites re-validate on save. */
export function readSyncedMcpJson(): SyncedMcpFile | null {
  const path = syncedMcpJsonPath()
  if (!existsSync(path)) {
    return null
  }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as SyncedMcpFile
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (error) {
    logForDebugging(`Ignoring ${path}: ${error}`, { level: 'warn' })
    return null
  }
}

function writeSyncedJson(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  const tmp = `${path}.tmp-${process.pid}`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, path)
  chmodSync(path, 0o600)
}

export function writeSyncedProviders(data: SyncedProvidersFile): void {
  writeSyncedJson(syncedProvidersPath(), data)
}

export function writeSyncedMcpJson(data: SyncedMcpFile): void {
  writeSyncedJson(syncedMcpJsonPath(), data)
}
