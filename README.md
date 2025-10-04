# MathQuest

MathQuest is an elementary-school math learning platform built on a Hono-based SSR application that targets Cloudflare Workers.
The repository bundles the edge runtime, supporting API/frontend packages, and Terraform-managed infrastructure so the team can
iterate on product, platform, and operations from a single mono-repo.

## Quick Start

### Prerequisites

This project relies on a small toolchain:

- **Homebrew** (macOS/Linux): System-level development tools (mise, just, git, pre-commit, uv, etc.)
- **mise**: Installs the runtime tool versions declared in `.tool-versions` (Node.js 22, pnpm 10, Terraform, Wrangler)
- **just**: Task runner that wires the setup/lint/dev workflows
- **pnpm**: JavaScript package manager used across the workspace (installed via mise during `just setup`)

### Setup

```bash
# 1. (macOS/Linux) Install Homebrew and Brewfile packages
make bootstrap

# 2. Install language/toolchain versions and JS dependencies via mise + pnpm
just setup
```

If Homebrew is already installed you can skip `make bootstrap` and instead run:

```bash
brew bundle install
just setup
```

### Available Commands

```bash
# Show all available tasks
just help

# Run code quality checks
just lint

# Fix common formatting issues
just fix

# Clean pre-commit cache
just clean

# Update development tools
just update-brew  # Update Homebrew packages
just update       # Update mise-managed tools
just update-hooks # Update pre-commit hooks

# Show mise status
just status
```

## Tool Responsibilities

This setup clearly separates tool responsibilities:

- **brew**: System-level development tools (git, pre-commit, mise, just, uv, rulesync, cf-vault, aws-vault)
- **mise**: Installs runtime tools defined in `.tool-versions` (Node.js, pnpm, Terraform, Wrangler)
- **pnpm**: Manages JavaScript/TypeScript workspaces under `apps/` and `packages/`
- **uv**: Python package and project management (used for supporting scripts)
- **pre-commit**: Runs all linting/formatting hooks automatically (no need to install each hook manually)

## Optional: rulesync

If you want to synchronize common config files from an external rules repository, see `docs/RULESYNC.ja.md` for setup and usage.
