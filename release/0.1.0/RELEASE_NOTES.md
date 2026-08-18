# Console Log Cleaner Release Notes - v0.1.0

- **Release Version**: 0.1.0
- **Release Date**: 2026-08-18
- **License**: MIT
- **Target VS Code Engine**: ^1.75.0

## Release Summary

Version 0.1.0 of Console Log Cleaner includes AST-based `console.log()` statement detection for JavaScript, TypeScript, JSX, and TSX files, extensible language architecture, Quick Fix code action support, and safe `WorkspaceEdit` file modification.

## Features & Improvements
- AST parsing via TypeScript Compiler API (`ts.createSourceFile`).
- Comment & string literal protection.
- Workspace and active file commands.
- Quick Fix Code Actions.
