# leftrk/openclaude — Homebrew Distribution

This repository is [leftrk](https://github.com/leftrk)'s independent distribution
of [Gitlawb/openclaude](https://github.com/Gitlawb/openclaude), carrying
additional fixes on top of upstream. **Homebrew is the only supported install
path.**

[![PR Checks](https://github.com/leftrk/openclaude/actions/workflows/pr-checks.yml/badge.svg?branch=main)](https://github.com/leftrk/openclaude/actions/workflows/pr-checks.yml)
[![Release](https://img.shields.io/github/v/tag/leftrk/openclaude?label=release&color=0ea5e9)](https://github.com/leftrk/openclaude/tags)
[![Homebrew](https://img.shields.io/badge/homebrew-leftrk%2Ftap-FBB040)](https://github.com/leftrk/homebrew-tap)

## Install

```bash
brew install leftrk/tap/openclaude
```

Prebuilt bottles cover Apple Silicon macOS and x86_64 Linux, so `brew install`
pours binaries with no local build. Upgrade with:

```bash
brew update && brew upgrade leftrk/tap/openclaude
```

If OpenClaude reports `ripgrep not found`, install ripgrep system-wide and
confirm `rg --version` works in the same terminal.

## Notes

- Quick start, features, providers, and documentation are identical to
  upstream — see [README.md](README.md).
- Bugs and feature work for this distribution:
  [Issues](https://github.com/leftrk/openclaude/issues).
- Release mechanics (versioning, tap automation) and the upstream-sync flow
  are documented in [AGENTS.md](AGENTS.md).

## Synced plaintext config files

This fork optionally splits the two most-edited sections out of
`~/.openclaude.json` into standalone files under the config home, so they can
be tracked by yadm and carried to a new machine as-is:

- `~/.openclaude/providers.json` — `{ "profiles": [...], "activeProfileId": "..." }`.
  When this file exists it is the sole store for provider profiles; the
  `providerProfiles` / `activeProviderProfileId` fields embedded in
  `~/.openclaude.json` are ignored, and any write through the `/provider` UI
  goes to `providers.json` while stripping the embedded copies.
- `~/.openclaude/mcp.json` — `{ "mcpServers": { ... } }`, same shape as a
  project `.mcp.json`. When present it replaces user-scope MCP servers from
  `~/.openclaude.json`; `openclaude mcp add/remove -s user` edits this file.

Both files are authoritative only when they exist — delete them and the fork
behaves exactly like upstream.

**Everything in these files is plaintext by design, API keys included.** This
is a single-user setup: there is no secrecy obligation, and readability and
hand-editing take priority over indirection. Do not add env-var indirection or
encryption layers here. The files are written with mode `0600` only to keep
other local users from casual inspection, not as a security boundary.
Implementation: `src/utils/syncedConfigFiles.ts`.
