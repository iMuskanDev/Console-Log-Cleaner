# Changelog

All notable changes to the `console-log-cleaner` extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-18

### Added
- Initial production release of `console-log-cleaner`.
- AST-based `console.log()` detection using TypeScript Compiler API (`ts.createSourceFile`).
- Extensible `LanguageAdapter` and `LanguageRegistry` architecture.
- Support for JavaScript (`.js`), TypeScript (`.ts`), React JSX (`.jsx`), and React TSX (`.tsx`).
- Workspace-wide and single-file scanning and removal commands.
- Quick Fix Code Action (`Remove console.log()`) for active editor cursor selection.
- Native VS Code `WorkspaceEdit` integration with full undo history (`Cmd+Z`).
- Custom workspace settings for test inclusions, exclude patterns, and removal confirmation.
- OutputChannel logger abstraction for production diagnostics.
- Comprehensive test suite covering 25 AST edge cases and fixtures.
- Automated `scripts/validate.sh` and `scripts/release.sh` workflow scripts.
