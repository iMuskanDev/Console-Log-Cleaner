# Development Guide

## Setup

1. Node.js (v16+) and npm installed.
2. Clone repository:
   ```bash
   git clone https://github.com/iMuskanDev/Console-Log-Cleaner.git
   cd Console-Log-Cleaner
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development Commands

- `npm run compile`: Build TypeScript into `./out`.
- `npm run watch`: Continuously compile TypeScript on file changes.
- `npm run typecheck`: Run strict TypeScript compiler check (`tsc --noEmit`).
- `npm run test`: Run Mocha unit tests.
- `npm run validate`: Execute complete validation script (`./scripts/validate.sh`).
- `npm run package`: Package extension into `.vsix` file using `@vscode/vsce`.

## Debugging in VS Code

1. Press `F5` or select **Run Extension** from VS Code Debug View.
2. An Extension Development Host window will open with the extension loaded.
3. Test commands (`Console Log Cleaner: Remove Console Logs From Current File`, etc.) via Command Palette (`Cmd+Shift+P`).
