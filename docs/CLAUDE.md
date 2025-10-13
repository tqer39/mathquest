# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a base boilerplate template repository intended to provide an underlying project structure and configuration files. This repository serves as a starting point for new projects with pre-configured development tools and workflows.

## Setup and Development Environment

### Initial Setup

This repository uses Homebrew for package management, mise for tool version management, and just for task automation:

```bash
# Step 1: Install Homebrew (if not already installed)
make bootstrap

# Step 2: Install all development tools
brew bundle install

# Step 3: Set up the development environment
just setup
```

**Alternative One-Command Setup** (if Homebrew is already installed):

```bash
just setup
```

### Tool Management with mise

```bash
# Install all tools defined in .tool-versions
mise install

# Check installed versions
mise list

# Upgrade tools to the latest versions
mise upgrade
```

### Task Management with just

```bash
# Display all available tasks
just help

# Set up the development environment (brew bundle + mise install + Claude/Gemini CLI + pre-commit install)
just setup

# Run all linting checks
just lint

# Run a specific pre-commit hook
just lint-hook <hook-name>

# Fix common formatting issues
just fix

# Clear the pre-commit cache (forced cleanup)
just clean

# Update pre-commit hooks
just update-hooks

# Update Homebrew packages
just update-brew

# Update mise-managed tools
just update

# Display mise status
just status
```

## Code Quality and Linting

This repository uses pre-commit hooks to enforce code quality. You can run them directly or use the just command:

```bash
# Using just (recommended)
just lint

# Or run pre-commit directly
pre-commit run --all-files
```

### Available pre-commit hooks

- **File Validation**: check-json, check-yaml, check-added-large-files
- **Security**: detect-aws-credentials, detect-private-key
- **Formatting**: end-of-file-fixer, trailing-whitespace, mixed-line-ending
- **YAML Linting**: yamllint
- **Spell Checking**: cspell (uses cspell.json configuration)
- **Markdown Linting**: markdownlint-cli2 (with auto-fixing)
- **Japanese Text Linting**: textlint with rules specific to Japanese
- **Secret Detection**: secretlint (detects hardcoded credentials with recommended presets)
- **Shell Script Linting**: shellcheck
- **GitHub Actions**: actionlint, prettier for workflow files
- **Terraform**: terraform_fmt
- **Renovate**: renovate-config-validator

## Spell Checking

The repository uses cspell for spell checking with a custom dictionary in `cspell.json`. The dictionary includes project-specific terms, tools, and proper nouns commonly used in development.

## Tool Architecture and Dependencies

### Tool Responsibilities

This setup has a clear separation of responsibilities:

- **brew**: System-level development tools (git, pre-commit, mise, just, uv)
- **mise**: Node.js version management only
- **uv**: Python package and project management
- **pre-commit**: Automatically handles all linting tools (no individual installation needed)

### Dependency Management

- **Renovate**: Automated dependency updates are configured through `renovate.json5`, extending from `github>tqer39/renovate-config`

## GitHub Workflows and Automation

The repository includes the following GitHub Actions workflows:

- **Pre-commit**: Runs on pushes to the main branch and on pull requests
- **Auto-assign**: Automatically assigns the PR creator using kentaro-m/auto-assign-action
- **Labeler**: Automatically labels PRs based on file patterns (supports editorconfig, document, terraform, textlint, yamllint, markdownlint, asdf, actionlint, CODEOWNERS)
- **License Year Update**: Automated license year maintenance

## Project Structure

- `.github/`: GitHub-specific configurations (workflows, CODEOWNERS, templates)
- `.editorconfig`: Editor settings for consistent code formatting
- `.pre-commit-config.yaml`: pre-commit hook configurations
- `.tool-versions`: Tool version definitions for mise
- `Brewfile`: Homebrew package definitions for brew bundle
- `cspell.json`: Spell checker configuration and custom dictionary
- `docs/`: Documentation files
- `justfile`: Task automation definitions
- `Makefile`: Homebrew bootstrap setup
- `renovate.json5`: Dependency update automation settings

## Code Ownership

- Global Codeowner: @tqer39 (defined in CODEOWNERS)

## Development Workflow

1.  Pre-commit hooks run automatically on commit.
2.  Pull requests are auto-assigned to the creator.
3.  PRs are auto-labeled based on the files changed.
4.  All pre-commit checks must pass before merging.
5.  Renovate automatically creates PRs for dependency updates.
