# Development tasks for boilerplate-base

# Use bash for all recipes to avoid zsh/sh incompatibilities
set shell := ["bash", "-c"]

# Common paths
edge_dir := "apps/edge"

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
    pre-commit install
    @if command -v pnpm >/dev/null 2>&1; then \
        echo "→ Installing JS dependencies with pnpm..."; \
        pnpm install; \
    else \
        echo "⚠ pnpm not found. Install pnpm (npm install -g pnpm) してから再実行してください。"; \
    fi
    @echo "Setup complete!"

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

# Format all supported files (Biome + Prettier via package script)
format:
    pnpm run format

# Format only staged files (typical git commit flow)
format-staged:
    pre-commit run prettier

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
    @if command -v pnpm >/dev/null 2>&1; then \
        echo "→ Installing JS dependencies with pnpm..."; \
        pnpm install; \
    else \
        echo "⚠ pnpm not found. Install pnpm (npm install -g pnpm) してから再実行してください。"; \
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
      (pnpm --filter @mathquest/api run dev & pid_api=$!; \
       pnpm --filter @mathquest/web run dev & pid_web=$!; \
       trap "kill $$pid_api $$pid_web 2>/dev/null || true" INT TERM EXIT; \
       wait)'

# Run Edge SSR (Cloudflare Workers via Wrangler)
dev-edge:
    @echo "Starting Edge SSR (Wrangler dev)..."
    pnpm --filter @mathquest/edge run dev

# Cloudflare D1 (local) utilities
d1-local-migrate:
    @echo "Applying local D1 migrations..."
    @cd {{edge_dir}} && pnpm exec wrangler d1 migrations apply DB --local

d1-local-query query="SELECT name FROM sqlite_master WHERE type='table';":
    @if [ -z "{{query}}" ]; then \
        echo "Usage: just d1-local-query \"<SQL>\"" && exit 1; \
    fi
    @cd {{edge_dir}} && pnpm exec wrangler d1 execute DB --local --command "{{query}}"

d1-local-reset:
    @echo "Resetting local D1 state (.wrangler/state)..."
    @cd {{edge_dir}} && rm -rf .wrangler/state && mkdir -p .wrangler/state

# Install JS dependencies with pnpm (can be run independently)
js-install:
    @if command -v pnpm >/dev/null 2>&1; then \
        echo "Installing JS dependencies with pnpm..."; \
        pnpm install; \
    else \
        echo "⚠ pnpm not found. npm install -g pnpm などで導入してください"; \
        exit 1; \
    fi

# Wrap terraform with convenient -chdir handling
# Usage examples:
#   just tf -chdir=dev/bootstrap init -reconfigure
#   just tf -chdir=infra/terraform/envs/dev/bootstrap plan
#   just tf version
tf *args:
    @echo "→ make terraform-cf ARGS='{{args}}'"
    @exec make terraform-cf ARGS="{{args}}"
