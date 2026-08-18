import * as vscode from 'vscode';

/**
 * Supported language IDs for JS/TS ecosystems
 */
const SUPPORTED_LANGUAGES = new Set([
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact'
]);

/**
 * Robustly removes console statements (e.g., console.log, console.error, console.warn, commented or uncommented)
 * while keeping catch blocks, parentheses, braces, and trailing formatting completely intact.
 */
export function removeConsoleFromText(text: string): string {
    const pattern = /(^[ \t]*(?:\/\/+[ \t]*)?|\b)console\.[a-zA-Z0-9_$]+[ \t]*\(/gm;
    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        const matchStartIndex = match.index;
        const matchedPrefix = match[1] || '';
        const callStartIndex = matchStartIndex + match[0].length - 1; // index of '('

        let depth = 1;
        let inString: string | null = null;
        let isEscaped = false;
        let callEndIndex = -1;

        // Balance parentheses while ignoring strings, template literals, and escape chars
        for (let i = callStartIndex + 1; i < text.length; i++) {
            const char = text[i];

            if (isEscaped) {
                isEscaped = false;
                continue;
            }

            if (char === '\\') {
                isEscaped = true;
                continue;
            }

            if (inString) {
                if (char === inString) {
                    inString = null;
                }
            } else {
                if (char === '"' || char === "'" || char === '`') {
                    inString = char;
                } else if (char === '(') {
                    depth++;
                } else if (char === ')') {
                    depth--;
                    if (depth === 0) {
                        callEndIndex = i;
                        break;
                    }
                }
            }
        }

        if (callEndIndex !== -1) {
            let endIndex = callEndIndex + 1;

            // Consume optional trailing semicolon
            if (endIndex < text.length && text[endIndex] === ';') {
                endIndex++;
            }

            // Consume trailing horizontal spaces/tabs
            while (endIndex < text.length && (text[endIndex] === ' ' || text[endIndex] === '\t')) {
                endIndex++;
            }

            const isFullLineMatch = /^[ \t]*(?:\/\/+[ \t]*)?/.test(matchedPrefix);

            if (isFullLineMatch) {
                // If console statement is on its own line, consume line break
                if (endIndex < text.length && text[endIndex] === '\r') {
                    endIndex++;
                }
                if (endIndex < text.length && text[endIndex] === '\n') {
                    endIndex++;
                }
                result += text.slice(lastIndex, matchStartIndex);
            } else {
                result += text.slice(lastIndex, matchStartIndex + matchedPrefix.length);
            }

            lastIndex = endIndex;
            pattern.lastIndex = endIndex;
        }
    }

    result += text.slice(lastIndex);
    return result;
}

/**
 * Processes a single file by URI and applies workspace edits if modified.
 */
async function processFile(uri: vscode.Uri): Promise<boolean> {
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        const fullText = document.getText();
        const cleanedText = removeConsoleFromText(fullText);

        if (fullText !== cleanedText) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(fullText.length)
            );
            edit.replace(uri, fullRange, cleanedText);
            await vscode.workspace.applyEdit(edit);
            await document.save();
            return true;
        }
    } catch (err) {
        console.error(`Failed to process file ${uri.fsPath}:`, err);
    }
    return false;
}

/**
 * Executes removal for active editor (all or selected text).
 */
async function handleRemoveConsole(target: 'all' | 'selected') {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
    }

    const document = editor.document;

    if (!SUPPORTED_LANGUAGES.has(document.languageId)) {
        vscode.window.showWarningMessage(
            `Remove Console: Language "${document.languageId}" is not explicitly supported (JS/TS family). Proceeding anyway.`
        );
    }

    if (target === 'all') {
        const fullText = document.getText();
        const cleanedText = removeConsoleFromText(fullText);

        if (fullText === cleanedText) {
            vscode.window.showInformationMessage('No console statements found.');
            return;
        }

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(fullText.length)
        );

        const success = await editor.edit((editBuilder) => {
            editBuilder.replace(fullRange, cleanedText);
        });

        if (success) {
            vscode.window.showInformationMessage('Successfully removed all console statements from the current file.');
        }
    } else if (target === 'selected') {
        const selection = editor.selection;

        if (selection.isEmpty) {
            vscode.window.showInformationMessage('No text selected. Please select a block of text first.');
            return;
        }

        const selectedText = document.getText(selection);
        const cleanedText = removeConsoleFromText(selectedText);

        if (selectedText === cleanedText) {
            vscode.window.showInformationMessage('No console statements found in selected text.');
            return;
        }

        const success = await editor.edit((editBuilder) => {
            editBuilder.replace(selection, cleanedText);
        });

        if (success) {
            vscode.window.showInformationMessage('Successfully removed console statements from selection.');
        }
    }
}

/**
 * Executes removal for the entire workspace.
 */
async function handleRemoveConsoleWorkspace() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage('No workspace folder open.');
        return;
    }

    const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to remove all console statements across the ENTIRE workspace?',
        { modal: true },
        'Yes',
        'Cancel'
    );

    if (confirm !== 'Yes') {
        return;
    }

    const files = await vscode.workspace.findFiles(
        '**/*.{js,ts,jsx,tsx}',
        '**/{node_modules,dist,out,build,.git}/**'
    );

    let modifiedCount = 0;

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Removing console statements from workspace...',
            cancellable: false
        },
        async (progress) => {
            const total = files.length;
            for (let i = 0; i < total; i++) {
                const uri = files[i];
                progress.report({ message: `${i + 1}/${total} files processed`, increment: (1 / total) * 100 });
                const wasModified = await processFile(uri);
                if (wasModified) {
                    modifiedCount++;
                }
            }
        }
    );

    if (modifiedCount > 0) {
        vscode.window.showInformationMessage(`Successfully removed console statements from ${modifiedCount} file(s) across the workspace.`);
    } else {
        vscode.window.showInformationMessage('No console statements found in any JS/TS files in the workspace.');
    }
}

export function activate(context: vscode.ExtensionContext) {
    const removeAllDisposable = vscode.commands.registerCommand('removeConsole.all', () => {
        handleRemoveConsole('all');
    });

    const removeSelectedDisposable = vscode.commands.registerCommand('removeConsole.selected', () => {
        handleRemoveConsole('selected');
    });

    const removeWorkspaceDisposable = vscode.commands.registerCommand('removeConsole.workspace', () => {
        handleRemoveConsoleWorkspace();
    });

    context.subscriptions.push(removeAllDisposable, removeSelectedDisposable, removeWorkspaceDisposable);
}

export function deactivate() {}
