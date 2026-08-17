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
