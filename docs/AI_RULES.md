# Common Rules for AI Assistants (English)

This document outlines project-specific instructions to ensure consistent behavior from assistants like Cursor, GitHub Copilot, Codex CLI, Gemini, Claude Code, etc., in this repository.

## Basic Policy

- All responses should be in Japanese.
- Changes should be minimal and focused; avoid unrelated modifications.
- Follow the repository guidelines (see `AGENTS.md`).
- If tools or workflows are changed, update the relevant documentation (`docs/`).
- Do not commit sensitive information (API keys, etc.). Detection hooks are active.

## Work Rules

- When changing code, match the surrounding style. Do not perform unnecessary refactoring.
- Adhere to root configurations: `.editorconfig`, `.prettierrc`, `.pre-commit-config.yaml`.
- Propose and apply changes that pass `just lint`.
- Reference files with inline code for paths (e.g., `src/app.ts:42`).
- Keep lengthy explanations concise. Organize key points with bullet points and short headings as needed.

## Command Execution Guidelines

- If local validation is possible, use the minimum necessary commands to confirm functionality.
- Prioritize using the project's commands:
  - Setup: `brew bundle install` → `just setup`
  - Run all linting: `just lint`
  - Auto-fix: `just fix`
  - Rule synchronization (optional): `just rulesync -- --check` / `just rulesync -- apply`

## Configuration File Generation with rulesync

- You can generate configuration files for AI assistants with `just rulesync -- generate`.
- Generation targets (initial):
  - `.cursorrules` (Cursor)
  - `.github/copilot-instructions.md` (GitHub Copilot Chat)
  - `CLAUDE.md` (Claude Code/Dev)
  - `docs/AI_RULES.ja.md` (this file: single source)
- The generated files are based on the content of this file, with a header added for each specific tool.

## Reference: Guideline Highlights (Excerpt)

- Commits should be short and in an imperative mood. Reference issues with `#123` if necessary.
- The existing CI runs `prek`. Be cautious when modifying workflows.
- Node is managed with `mise`, and Python with `uv`. Adhere to the fixed versions.
