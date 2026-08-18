import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { LanguageRegistry } from './languages/core/LanguageRegistry';
import { JavaScriptAdapter } from './languages/javascript/JavaScriptAdapter';
import { DetectorEngine } from './detectors/detectorEngine';
import { FileService } from './services/fileService';
import { WorkspaceService } from './services/workspaceService';
import { ConsoleLogCodeActionProvider } from './providers/codeActionProvider';

import { scanCurrentFileCommand } from './commands/scanCurrentFile';
import { scanWorkspaceCommand } from './commands/scanWorkspace';
import { removeConsoleLogsFromFileCommand } from './commands/removeConsoleLogsFromFile';
import { removeConsoleLogsFromWorkspaceCommand } from './commands/removeConsoleLogsFromWorkspace';

export function activate(context: vscode.ExtensionContext): void {
  // Initialize internal Logger OutputChannel abstraction
  Logger.initialize('Console Log Cleaner');
  Logger.info('Console Log Cleaner extension activating...');

  // Initialize Language Registry and register built-in JavaScript/TypeScript adapter
  const registry = LanguageRegistry.getInstance();
  registry.registerAdapter(new JavaScriptAdapter());

  // Initialize Core Services
  const detectorEngine = new DetectorEngine(registry);
  const fileService = new FileService();
  const workspaceService = new WorkspaceService();

  // Register Code Action Quick Fix Provider
  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    [
      { language: 'javascript' },
      { language: 'javascriptreact' },
      { language: 'typescript' },
      { language: 'typescriptreact' }
    ],
    new ConsoleLogCodeActionProvider(),
    {
      providedCodeActionKinds: ConsoleLogCodeActionProvider.providedCodeActionKinds
    }
  );
  context.subscriptions.push(codeActionProvider);

  // Register Commands
  const scanCurrentFileDisp = vscode.commands.registerCommand(
    'consoleLogCleaner.scanCurrentFile',
    () => scanCurrentFileCommand(detectorEngine)
  );

  const scanWorkspaceDisp = vscode.commands.registerCommand(
    'consoleLogCleaner.scanWorkspace',
    () => scanWorkspaceCommand(workspaceService)
  );

  const removeCurrentFileDisp = vscode.commands.registerCommand(
    'consoleLogCleaner.removeCurrentFile',
    () => removeConsoleLogsFromFileCommand(detectorEngine, fileService)
  );

  const removeWorkspaceDisp = vscode.commands.registerCommand(
    'consoleLogCleaner.removeWorkspace',
    () => removeConsoleLogsFromWorkspaceCommand(workspaceService)
  );

  context.subscriptions.push(
    scanCurrentFileDisp,
    scanWorkspaceDisp,
    removeCurrentFileDisp,
    removeWorkspaceDisp
  );

  Logger.info('Console Log Cleaner extension activated successfully.');
}

export function deactivate(): void {
  Logger.info('Console Log Cleaner extension deactivating...');
  Logger.dispose();
}
