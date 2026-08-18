# Console Log Cleaner - Architecture Overview

## Overview

`console-log-cleaner` is built on a decoupled, adapter-based architecture. Language parsing, statement detection, and removal range calculation are completely separated from core extension management, commands, and VS Code UI components.

## Core Architectural Diagram

```
                 VS Code Extension Host
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   Command Handlers               Code Action Provider
         │                                 │
         └────────────────┬────────────────┘
                          ▼
                   Detector Engine
                          │
                          ▼
                  Language Registry
                          │
                          ▼
            LanguageAdapter (Interface)
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
JavaScript/TypeScript              [Future Languages]
    Adapter (AST)                  (Python, Java, C++)
         │
         ▼
 TypeScript Compiler API
(ts.createSourceFile AST)
         │
         ▼
  DetectionResult[]
         │
         ▼
  Removal Engine & WorkspaceEdit
```

## Key Abstractions

### 1. `LanguageAdapter` (`src/languages/core/LanguageAdapter.ts`)
Defines the contract for language parsing, statement identification, and edit range calculations.
- `supportedLanguageIds`: List of VS Code language identifiers handled by this adapter.
- `supportedExtensions`: Supported file extensions.
- `detect()`: Converts source text into `DetectionResult[]`.
- `calculateRemovalEdit()`: Produces a precise `vscode.TextEdit` for removal.

### 2. `LanguageRegistry` (`src/languages/core/LanguageRegistry.ts`)
A singleton registry mapping file extensions and language IDs to registered `LanguageAdapter` implementations.

### 3. `TypeScriptDetector` (`src/languages/javascript/TypeScriptDetector.ts`)
Uses `ts.createSourceFile` to inspect AST nodes:
- Traverses AST looking for `ts.CallExpression` where expression is `console.log`.
- Rejects `window.console.log`, `globalThis.console.log`, `console["log"]`, `obj.console.log`, strings, comments, and variables.

### 4. `RemovalStrategy` (`src/languages/core/RemovalStrategy.ts`)
Converts statement AST spans into safe replacement ranges.
- Full-line statements: removes leading indentation and trailing line breaks so no blank line is left behind.
- Inline statements: removes statement and adjacent trailing spaces while preserving surrounding syntax.

### 5. `Logger` (`src/utils/logger.ts`)
Encapsulates an `OutputChannel` ("Console Log Cleaner"). Zero `console.log()` calls exist in production extension code.
