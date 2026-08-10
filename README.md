<div align="center">
  <img src="docs/assets/openclaude-wordmark.png" alt="OpenClaude — Open terminal for any LLM" width="830">
</div>

OpenClaude is an open-source coding-agent CLI for cloud and local model providers.
Use OpenAI-compatible APIs, Gemini, GitHub Models, Codex, Ollama, and other
backends while keeping one terminal-first workflow: prompts, tools, agents,
MCP, slash commands, and streaming output.

> **This repository** ([leftrk/openclaude](https://github.com/leftrk/openclaude)) is an
> independent distribution based on [Gitlawb/openclaude](https://github.com/Gitlawb/openclaude),
> carrying additional fixes on top of upstream. **Homebrew is the only supported
> install path.**

[![PR Checks](https://github.com/leftrk/openclaude/actions/workflows/pr-checks.yml/badge.svg?branch=main)](https://github.com/leftrk/openclaude/actions/workflows/pr-checks.yml)
[![Release](https://img.shields.io/github/v/tag/leftrk/openclaude?label=release&color=0ea5e9)](https://github.com/leftrk/openclaude/tags)
[![Homebrew](https://img.shields.io/badge/homebrew-leftrk%2Ftap-FBB040)](https://github.com/leftrk/homebrew-tap)
[![License](https://img.shields.io/badge/license-MIT-2563eb)](LICENSE)

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

## Quick Start

```bash
openclaude
```

Then run `/provider` for guided provider setup and saved profiles
(`/onboard-github` for GitHub Models). Useful bits:

- `openclaude --continue` / `--resume <session-id>` — pick up a previous conversation
- `openclaude --bg "task"` + `openclaude ps` / `logs` / `kill` — detached background sessions
- `/buddy` — hatch a pixel-art companion beside your prompt
- Config lives in `~/.openclaude` and `~/.openclaude.json`; `~/.claude` is not read

## Features

- One CLI across cloud APIs and local backends — no per-provider tooling
- Full coding-agent toolkit: bash, file tools, grep/glob, sub-agents, tasks, MCP, slash commands
- Per-agent provider/model routing and step limits — [guide](docs/agent-routing.md)
- Free web search via DuckDuckGo on non-Anthropic models; optional Firecrawl key for JS-heavy pages
- Repo map codebase intelligence (`/repomap`) — [docs](docs/repo-map.md)
- Headless gRPC server for integrations — [docs](docs/grpc-server.md)
- VS Code extension in [`vscode-extension/openclaude-vscode`](vscode-extension/openclaude-vscode)

## Providers

Run `/provider` inside the CLI for the full guided list. Highlights:
OpenAI-compatible endpoints (OpenAI, OpenRouter, DeepSeek, Groq, Mistral,
LM Studio…), Gemini, GitHub Models, Codex OAuth/CLI, Ollama, Z.AI GLM,
Fireworks, Xiaomi MiMo, NEAR AI, Cloudflare Workers AI, OpenCode Zen/Go,
Bedrock / Vertex / Foundry, and more.

## Documentation

- Getting started: [Non-Technical Setup](docs/non-technical-setup.md) · [macOS / Linux](docs/quick-start-mac-linux.md) · [Windows](docs/quick-start-windows.md)
- Deep dives: [Advanced Setup](docs/advanced-setup.md) · [Smart Routing](docs/smart-routing.md) · [Agent Routing](docs/agent-routing.md)

## Development

Node.js `>=22` and Bun `>=1.3.13` for source builds:

```bash
bun install
bun run build
bun run dev
```

Tests: `bun test` (full suite) or `bun test path/to/file.test.ts` (focused).
See [AGENTS.md](AGENTS.md) for the contributor workflow and validation commands.

## Community

- [Issues](https://github.com/leftrk/openclaude/issues) — bugs and feature work for this distribution
- Upstream: [Gitlawb/openclaude](https://github.com/Gitlawb/openclaude) · [Discussions](https://github.com/Gitlawb/openclaude/discussions) · [Discord](https://discord.gg/k68zFR6AcB)

## Security, Disclaimer, License

Found a security issue? See [SECURITY.md](SECURITY.md).

OpenClaude is an independent community project and is not affiliated with,
endorsed by, or sponsored by Anthropic. It originated from the Claude Code
codebase; "Claude" and "Claude Code" are trademarks of Anthropic PBC.
MIT for contributors' modifications; the derived Claude Code remains
Anthropic's — see [LICENSE](LICENSE).
