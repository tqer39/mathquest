# Development tasks for boilerplate-base

# Use bash for all recipes to avoid zsh/sh incompatibilities
set shell := ["bash", "-c"]

# Packages: AI CLI tools installed via Node.js (managed by mise)
ai_cli_pkgs := "@anthropic-ai/claude-code @google/gemini-cli @openai/codex"

# Show available commands
help:
    @just --list

# Setup development environment
setup:
    @echo "Setting up development environment..."
    brew bundle install
    @if command -v mise >/dev/null 2>&1; then \
        echo "→ Installing tools with mise..."; \
        eval "$(mise activate bash)"; \
        mise install; \
    else \
        echo "⚠ mise not found. Please run 'make bootstrap' first."; \
        exit 1; \
    fi
    @just ai-install
    pre-commit install
    @if command -v bun >/dev/null 2>&1; then \
        echo "→ Installing JS dependencies with bun..."; \
        bun install; \
    else \
        echo "⚠ bun not found. Skip 'bun install'. Run 'mise install' or install bun and re-run 'just setup'."; \
    fi
    @echo "Setup complete!"

# Install AI CLI tools only (can be run independently)
ai-install:
    @echo "→ Installing Node.js AI CLI tools..."
    mise exec node -- npm install -g {{ai_cli_pkgs}}

# Run pre-commit hooks on all files
lint:
    pre-commit run --all-files

# Run specific pre-commit hook
lint-hook hook:
    pre-commit run {{hook}}

# Update pre-commit hooks to latest versions
update-hooks:
    pre-commit autoupdate

# Fix common formatting issues
fix:
    pre-commit run end-of-file-fixer --all-files
    pre-commit run trailing-whitespace --all-files
    pre-commit run markdownlint-cli2 --all-files

# Clean pre-commit cache
clean:
    @echo "Cleaning pre-commit cache..."
    -pre-commit clean
    @if [ -d ~/.cache/pre-commit ]; then \
        echo "→ Force removing pre-commit cache directory..."; \
        rm -rf ~/.cache/pre-commit; \
    fi
    @echo "Clean complete!"

# Show mise status
status:
    mise list

# Install mise tools
install:
    @echo "Installing tools with mise..."
    mise install
    @if command -v bun >/dev/null 2>&1; then \
        echo "→ Installing JS dependencies with bun..."; \
        bun install; \
    else \
        echo "⚠ bun not found. Skip 'bun install'. Run 'mise install' or install bun and re-run 'just install'."; \
    fi

# Update mise tools
update:
    mise upgrade

# Update brew packages
update-brew:
    brew update
    brew bundle install
    brew upgrade

# Run rulesync with passthrough args
rulesync args='':
    @if [[ "{{args}}" =~ ^generate(\s|$) ]]; then \
        echo "Generating AI assistant configs from docs/AI_RULES.ja.md"; \
        bash scripts/rulesync-generate.sh; \
    elif command -v rulesync >/dev/null 2>&1; then \
        echo "Running: rulesync {{args}}"; \
        rulesync {{args}}; \
    else \
        echo "⚠ rulesync が見つかりません。docs/RULESYNC.ja.md を参照してインストールしてください。"; \
        exit 1; \
    fi

# Run API and Web dev servers together (Node local)
dev-node:
    @echo "Starting API (8787) and Web (8788)..."
    bash -lc 'set -euo pipefail; \
      (bun run dev:api & pid_api=$!; \
       bun run dev:web & pid_web=$!; \
       trap "kill $$pid_api $$pid_web 2>/dev/null || true" INT TERM EXIT; \
       wait)'

# Run Edge SSR (Cloudflare Workers via Wrangler)
dev-edge:
    @echo "Starting Edge SSR (Wrangler dev)..."
    bun run dev:edge

# Install JS dependencies with bun (can be run independently)
js-install:
    @if command -v bun >/dev/null 2>&1; then \
        echo "Installing JS dependencies with bun..."; \
        bun install; \
    else \
        echo "⚠ bun not found. Run 'mise install' or 'brew install oven-sh/bun/bun'"; \
        exit 1; \
    fi
