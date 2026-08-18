# Security Policy

## Security Principles

1. **Local Processing Only**: All parsing, AST traversal, and file modifications are performed 100% locally on your workstation using VS Code APIs.
2. **Zero Remote Uploads**: Source code content is never transmitted to any external server or API.
3. **No Telemetry**: The extension does not track user behavior or send telemetry events by default.
4. **Controlled Modifications**: File edits occur exclusively through VS Code's official `vscode.WorkspaceEdit` API, respecting read-only files and preserving undo history.

## Reporting Security Issues

If you discover a security vulnerability or unexpected behavior, please report it via GitHub Issues or contact the maintainers at `https://github.com/iMuskanDev/Console-Log-Cleaner`.
