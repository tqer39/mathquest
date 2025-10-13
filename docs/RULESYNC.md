# rulesync Implementation Guide

This is a minimal guide for introducing rulesync into this repository. rulesync is a CLI tool for safely synchronizing common rules and configuration files across multiple projects.

## Purpose

- To fetch and synchronize common settings like `.editorconfig`, `.prettierrc`, `cspell.json`, and `.markdownlint.json` from an external "rules repository."
- To detect differences (drift detection) and apply them automatically.

## Installation

Several installation paths are anticipated depending on the environment and distribution method. Please choose one that suits your environment.

- Homebrew (recommended, if available)
  - e.g., `brew install rulesync` or `brew install <tap>/rulesync`
- Rust/Cargo (if you have a Rust environment)
  - e.g., `cargo install rulesync`
- Binary distribution (if downloadable from GitHub Releases)
  - Place the `rulesync` executable in a directory included in your `PATH`.

Note: Please follow the official rulesync README/documentation for actual distribution methods and installation procedures.

## Configuration File

Place a `.rulesync.yaml` (or `.rulesync.yml`) file in the root directory. This repository includes a template (comments only). Please enable it according to your rules repository.

```yaml
# .rulesync.yaml (example)
#
# version: 1
# sources:
#   - name: org-rules
#     # Specify the repository distributing the rules (fix the branch/tag as appropriate)
#     repo: github:your-org/your-rules-repo
#     ref: main
#     files:
#       - source: templates/.editorconfig
#         target: .editorconfig
#         mode: copy   # copy/merge/template, etc., according to the tool's specifications
#       - source: templates/.prettierrc
#         target: .prettierrc
#         mode: copy
```

Please refer to the official rulesync documentation for schema and option names. The above is an image of the syntax, so please check the specifications before uncommenting.

## Usage

- Dry-run/Check for differences (example)
  - Check commands provided by the tool, such as `rulesync --check` or `rulesync diff`.
- Apply (example)
  - `rulesync apply`

This repository's `just` file includes a generic `rulesync` task (arguments are passed through).

```bash
# Display help
just rulesync -- --help

# Check for differences (example)
just rulesync -- --check

# Apply rules (example)
just rulesync -- apply
```

## Integration with pre-commit (Optional)

If you want to automatically check for drift in CI/locally, you can run rulesync as a local pre-commit hook.

A "commented-out template" is left at the end of `.pre-commit-config.yaml`. Please adjust the actual command line (`--check`, etc.) to match your rules and uncomment it.

## Operational Guide

- Flow for updating rules
  - Update in the rules repository → Run `just rulesync -- apply` in this repository → Commit the differences.
- Version pinning
  - Pin the `ref` to a tag/commit SHA in `.rulesync.yaml` to ensure reproducibility.
- Conflict/Overwrite policy
  - Control safely with rulesync's features, such as `mode` and ignore patterns.

## Troubleshooting

- `rulesync` not found
  - Check your `PATH`, re-run the installation steps.
- Differences always appear
  - Review the target/exclude patterns and `mode` in `.rulesync.yaml`.
  - Check for consistency with local file auto-formatting (prettier/markdownlint/cspell, etc.).
