# Changelog

All notable changes to the `console-log-cleaner` extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - Unreleased

### Added
- Phase 2 method expansion: support for all 18 JavaScript/TypeScript `console` methods (`log`, `info`, `warn`, `error`, `debug`, `trace`, `dir`, `table`, `time`, `timeEnd`, `timeLog`, `count`, `countReset`, `assert`, `clear`, `group`, `groupCollapsed`, `groupEnd`).
- 18 individual removal commands targeting specific console methods.
- Bulk cleanup command `Console Log Cleaner: Remove Enabled Console Statements` using configuration setting `consoleLogCleaner.enabledMethods`.
- Bulk cleanup command `Console Log Cleaner: Remove All Console Statements`.
- Selection-based removal command `Console Log Cleaner: Remove Console Statements From Selection`.
- Configuration setting `consoleLogCleaner.previewBeforeRemove` with side-by-side diff preview window before applying edits.
- Editor context menu submenu (`Console Log Cleaner`).
- Central console method registry (`CONSOLE_METHODS`) and paired method abstractions (`src/console/pairedMethods.ts`).
- Comprehensive Phase 2 test suite in `src/test/phase2Methods.test.ts`.

### Improved
- AST parser (`TypeScriptDetector`) updated to support dynamic method matching across all 18 methods.
- Quick Fix Code Actions updated to offer targeted `Remove console.<method>()` for any active statement.

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
