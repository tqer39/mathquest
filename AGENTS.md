# Repository Guidelines

## Project Structure & Module Organization

- Root: development tooling and docs; no app runtime yet.
- `.github/`: workflows, `CODEOWNERS`, labels, PR template.
- `docs/`: Japanese docs for setup and usage.
- `Makefile`, `justfile`, `Brewfile`: environment bootstrap and tasks.
- Config: `.editorconfig`, `.pre-commit-config.yaml`, `.prettierrc`, `.tool-versions`.

## Build, Test, and Development Commands

- `make bootstrap`: install Homebrew (macOS/Linux) only.
- `brew bundle install`: install dev tools from `Brewfile`.
- `just setup`: provision tools via mise, install AI CLIs, install pre-commit.
- `just lint`: run all pre-commit checks on all files.
- `just fix`: apply common auto-fixes (EOF, whitespace, markdown).
- `just update-brew | just update | just update-hooks`: update packages, tools, hooks.

## Coding Style & Naming Conventions

- Indentation via `.editorconfig`: 2 spaces default; Python 4; `Makefile` tabs; LF EOL; final newline.
- Formatting: Prettier (config in `.prettierrc`), markdownlint, yamllint.
- Text quality: cspell, textlint for Markdown; keep filenames lowercase with hyphens where practical.
- Shell: shellcheck-compliant; YAML/JSON must be valid and lintable.

## Testing Guidelines

- This boilerplate centers on linting; no unit test framework is preset.
- If adding code, place tests under `tests/` and follow ecosystem norms:
  - JavaScript: `__tests__/` or `*.test.ts`.
  - Python: `tests/test_*.py` with pytest.
- Ensure `just lint` passes before opening a PR; add CI for new languages as needed.

## Commit & Pull Request Guidelines

- Commits: short, imperative mood; optional emoji is fine (see `git log`).
- Reference issues with `#123` when applicable.
- PRs: use the template; keep descriptions concise; include rationale and screenshots/output for visible changes.
- CI: pre-commit runs in GitHub Actions; `CODEOWNERS` auto-requests reviews.

## Security & Configuration Tips

- Do not commit secrets; hooks detect AWS creds and private keys.
- GitHub Actions require `OPENAI_API_KEY` for PR description generation.
- Tool versions are managed by mise (`.tool-versions`, Node.js pinned).

## Agent-Specific Instructions

- Follow these guidelines, keep diffs minimal, and update docs when changing tooling.
- Run `just lint` locally and ensure workflows remain green.
