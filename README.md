# Console Log Cleaner

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https.mit-license.org)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-v1.75%2B-blue)](https://marketplace.visualstudio.com/)

Find and safely remove `console.log()` statements from JavaScript and TypeScript files using robust AST parsing.

---

## Features

- 🎯 **AST-Based Precision**: Uses the TypeScript Compiler API (`ts.createSourceFile`) to accurately detect `console.log()` calls in JavaScript, TypeScript, JSX, and TSX files.
- 🛡️ **Comment & String Safe**: Ignores commented-out code (`// console.log()`), string literals (`"console.log()"`), template literals, variable names, and property names.
- ⚡ **Extensible Language Architecture**: Built on a language adapter plugin system (`LanguageAdapter`), laying the foundation for future language additions (Python, Java, C++, etc.).
- 🔄 **Native Undo Integration**: Performs file edits via VS Code `WorkspaceEdit`, allowing full undo history (`Cmd+Z` / `Ctrl+Z`).
- 💡 **Quick Fix Code Actions**: Position your cursor over any `console.log()` statement to trigger a `Remove console.log()` quick fix action.
- ⚙️ **Configurable Workspace Scans**: Filter out test files, build directories, or custom glob patterns.

---

## Supported Languages

| Language | Extensions | Initial Scope Target | Detection Strategy |
| :--- | :--- | :--- | :--- |
| **JavaScript** | `.js`, `.mjs`, `.cjs` | `console.log(...)` | AST (`TypeScript Compiler API`) |
| **TypeScript** | `.ts` | `console.log(...)` | AST (`TypeScript Compiler API`) |
| **React JSX** | `.jsx` | `console.log(...)` | AST (`TypeScript Compiler API`) |
| **React TSX** | `.tsx` | `console.log(...)` | AST (`TypeScript Compiler API`) |

*For complete details and future language support, see [SUPPORTED-LANGUAGES.md](docs/SUPPORTED-LANGUAGES.md).*

---

## Usage & Commands

| Command Title | Command ID | Description |
| :--- | :--- | :--- |
| **Console Log Cleaner: Remove Console Logs From Current File** | `consoleLogCleaner.removeCurrentFile` | Detects and removes all `console.log()` statements in the active editor file. |
| **Console Log Cleaner: Remove Console Logs From Workspace** | `consoleLogCleaner.removeWorkspace` | Scans workspace files, prompts for confirmation, and batch-removes detected statements. |
| **Console Log Cleaner: Scan Current File** | `consoleLogCleaner.scanCurrentFile` | Reports the count of detected `console.log()` statements in current active editor without modifying file. |
| **Console Log Cleaner: Scan Workspace** | `consoleLogCleaner.scanWorkspace` | Scans workspace and reports file-by-file detection metrics. |

---

## Extension Settings

This extension contributes the following settings:

- `consoleLogCleaner.includeTests`: Include test files (`.test.ts`, `.spec.js`) when scanning or removing. (Default: `true`)
- `consoleLogCleaner.includeNodeModules`: Include `node_modules` directory during workspace operations. (Default: `false`)
- `consoleLogCleaner.excludePatterns`: Glob patterns for files/folders to exclude. (Default: `["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/out/**", "**/coverage/**"]`)
- `consoleLogCleaner.showNotifications`: Display completion toasts. (Default: `true`)
- `consoleLogCleaner.confirmBeforeRemoval`: Show confirmation prompt prior to executing removal. (Default: `true`)

---

## Safety & Security

Console Log Cleaner operates **100% locally** on your machine.
- Zero source code upload or external API dependencies.
- Zero telemetry collection by default.
- Zero raw regex deletions on arbitrary files.

For full security policy details, see [SECURITY.md](docs/SECURITY.md).

---

## Development & Testing

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run Unit Tests
npm run test

# Run Validation Pipeline
npm run validate
```

For complete development and architecture documentation, see:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [DEVELOPMENT.md](docs/DEVELOPMENT.md)
- [ROADMAP.md](docs/ROADMAP.md)

---

## License

[MIT](LICENSE) © 2026 iMuskanDev
