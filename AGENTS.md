# AGENTS.md - AI Agent Coding Guide

This guide is for AI coding agents working in the OpenClaude repository. Read it before changing code, and also follow [CONTRIBUTING.md](CONTRIBUTING.md) for contributor policy, PR expectations, review follow-up, and project scope.

## Project Snapshot

OpenClaude is a coding-agent CLI for cloud and local model providers. It supports OpenAI-compatible APIs, Anthropic, Gemini, DeepSeek, Ollama, MCP, local backends, slash commands, tools, agents, and a React/Ink terminal UI.

The installed CLI runs on Node.js `>=22.0.0`. Bun is used for source builds, scripts, dependency management, and tests.

## Work Style

- Keep changes focused on one problem.
- Prefer existing patterns in the file or nearby module.
- Avoid unrelated formatting, renames, dependency changes, or broad rewrites.
- Add or update tests when behavior changes.
- Update docs when setup, commands, provider behavior, or user-facing behavior changes.
- For new features, larger refactors, dependencies, or runtime changes, follow the issue-first guidance in [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack And Conventions

- TypeScript with strict mode and ESM imports.
- React + Ink for terminal UI.
- Bun lockfile and Bun scripts for development workflows.
- Node runtime for the built CLI.

Common libraries and patterns:

- `chalk` for terminal color.
- `commander` for CLI argument parsing.
- `execa` for child processes.
- Existing service, provider, settings, permission, and UI patterns over new abstractions.

## Repository Map

- `src/commands/` - slash and CLI command implementations.
- `src/components/` - React/Ink UI components.
- `src/services/` - API, MCP, OAuth, wiki, voice, and other service integrations.
- `src/tools/` - tool implementations.
- `src/utils/` - shared utilities.
- `src/integrations/` - provider and model integration metadata.
- `src/entrypoints/` - CLI, MCP, SDK, and generated public types.
- `src/tasks/` - local, remote, workflow, and monitor task handling.
- `docs/integrations/` - provider integration guidance.
- `web/` - documentation website.

## Validation

Run the narrowest useful checks for your change, and list the exact commands in the PR.

Core checks:

```bash
bun install
bun run build
bun run smoke
bun run check
bun run typecheck
bun run typecheck:type-tests
```

Focused checks:

```bash
bun test ./path/to/test-file.test.ts
bun run test:provider
bun run test:provider-recommendation
```

Web checks, when touching `web/`:

```bash
bun run web:typecheck
bun run web:build
```

Website release notes live on GitHub Releases; do not add a manually maintained release-notes data source to the static site.

Diagnostics and PR hygiene:

```bash
bun run doctor:runtime
bun run security:pr-scan
```

## Provider Changes

When modifying provider behavior:

1. Start with `docs/integrations/overview.md`.
2. Use the relevant how-to guide under `docs/integrations/how-to/`.
3. Check existing provider implementations before adding a new pattern.
4. Test the exact provider/model path you changed when possible.
5. Avoid breaking third-party providers while fixing first-party behavior.

## Things To Avoid

- Do not change the Node runtime or Bun development workflow without prior maintainer agreement.
- Do not add new Python code, Python provider paths, or Python dependencies without explicit maintainer approval.
- Do not introduce dependencies without clear project benefit.
- Do not skip tests for behavior changes.
- Do not silently change provider tags; maintainers control them during review.
- Do not ignore CodeRabbit or maintainer feedback; address it before requesting more review.
- Do not add a manually maintained release-notes data source to the static site; link to GitHub Releases instead.

## Release Flow (leftrk fork)

- Releases ship via the `leftrk/tap` Homebrew tap: commit `chore(release): vX.Y.Z` (bump `package.json` + `.release-please-manifest.json`), `git tag vX.Y.Z`, push both — `.github/workflows/homebrew-tap.yml` bumps the formula and triggers bottle rebuilds automatically. Versioning is Chrome-style major-first (28, 29, ...); minor bumps (28.1.0) are fine for small releases.

## Upstream Sync (leftrk fork)

This fork tracks `upstream/main` (Gitlawb/openclaude) by **rebasing the fork stack**, not merging. The repo is maintained by a single user, so force-pushing `main` is acceptable.

- Sync cadence: every 1–2 weeks or after each upstream release, while the delta is small.
- Procedure: `git fetch upstream` (GitHub may need the local SOCKS5 proxy: `git -c http.proxy=socks5h://127.0.0.1:1080 fetch upstream`), then `git rebase upstream/main`, then verify and `git push --force-with-lease origin main`.
- `rerere` is enabled — keep it on; repeated conflict shapes resolve automatically.
- Expected recurring conflicts: `package.json` / `.release-please-manifest.json` version lines on release commits (take the release commit's version), `README.md` (fork slimmed it to brew-only; keep the fork version), `AGENTS.md` (keep upstream bullets, keep fork sections appended at the end).
- Never move or re-point existing release tags — they were already consumed by the Homebrew tap. They will not be ancestors of rebased `main`; that is expected.
- Watch out for resolutions that lived in old merge commits: a rebase drops merge commits, and any conflict resolution whose effect existed only in a merge tree silently disappears (this once dropped the tool-result semantic-boundary wiring in `requestPreparation.ts`). After each rebase, diff the new tree against the pre-rebase state and restore anything unintentionally lost.
- After syncing, run `bun run typecheck` plus focused tests on files both sides touched (typically `src/utils/providerProfile*`, `src/integrations/runtimeMetadata*`, `src/integrations/aimlapi/`, `src/services/api/openaiShim*`).
- Keep the fork delta small: PR generally useful fixes upstream instead of letting the local stack grow.
