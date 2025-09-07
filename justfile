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
    mise install

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
