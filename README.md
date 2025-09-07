# boilerplate-base

A base boilerplate template for projects with pre-configured development tools and workflows.

## Quick Start

### Prerequisites

This project uses different tools for different purposes:

- **Homebrew**: System-level development tools
- **mise**: Programming language version management
- **just**: Task automation and command runner

### Setup

```bash
# 1. Install Homebrew (if not already installed)
make bootstrap

# 2. Install all development tools
brew bundle install

# 3. Setup development environment
just setup
```

**Alternative one-command setup** (if Homebrew is already installed):

```bash
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

- **brew**: System-level development tools (git, pre-commit, mise, just, uv)
- **mise**: Node.js version management only
- **uv**: Python package and project management
- **pre-commit**: Handles all linting tools automatically (no need to install separately)

### Automated AI CLI Tools

The setup automatically installs AI development tools during `just setup` (or manually via `just ai-install`):

- **Claude Code CLI**: `@anthropic-ai/claude-code` - For AI-assisted development
- **Gemini CLI**: `@google/gemini-cli` - Alternative AI assistant
- **OpenAI Codex CLI**: `@openai/codex` - OpenAI CLI for code workflows

This approach ensures clean separation of concerns and avoids conflicts between system tools and language-specific versions.

## Optional: rulesync

If you want to synchronize common config files from an external rules repository, see `docs/RULESYNC.ja.md` for setup and usage.
