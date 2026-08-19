import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { LanguageRegistry } from './languages/core/LanguageRegistry';
import { JavaScriptAdapter } from './languages/javascript/JavaScriptAdapter';
import { DetectorEngine } from './detectors/detectorEngine';
import { FileService } from './services/fileService';
import { WorkspaceService } from './services/workspaceService';
import { PreviewService } from './services/previewService';
import { ConsoleLogCodeActionProvider } from './providers/codeActionProvider';
import { CONSOLE_METHODS, ConsoleMethod } from './console/consoleMethods';

import { scanCurrentFileCommand } from './commands/scanCurrentFile';
import { scanWorkspaceCommand } from './commands/scanWorkspace';
import { removeConsoleLogsFromFileCommand } from './commands/removeConsoleLogsFromFile';
import { removeConsoleLogsFromWorkspaceCommand } from './commands/removeConsoleLogsFromWorkspace';
import { removeConsoleMethodCommand } from './commands/removeConsoleMethod';
import { removeEnabledMethodsCommand } from './commands/removeEnabledMethods';
import { removeAllMethodsCommand } from './commands/removeAllMethods';
import { removeFromSelectionCommand } from './commands/removeFromSelection';

export function activate(context: vscode.ExtensionContext): void {
  // Initialize Logger OutputChannel
  Logger.initialize('Console Log Cleaner');
  Logger.info('Console Log Cleaner extension activating (Phase 2)...');

  // Initialize Language Registry and register JS/TS adapter
  const registry = LanguageRegistry.getInstance();
  registry.registerAdapter(new JavaScriptAdapter());

  // Initialize Core Services
  const detectorEngine = new DetectorEngine(registry);
  const fileService = new FileService();
  const workspaceService = new WorkspaceService();
  PreviewService.initialize(context);

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

  // Register Preserved v0.1.x Commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'consoleLogCleaner.scanCurrentFile',
      () => scanCurrentFileCommand(detectorEngine)
    ),
    vscode.commands.registerCommand(
      'consoleLogCleaner.scanWorkspace',
      () => scanWorkspaceCommand(workspaceService)
    ),
    vscode.commands.registerCommand(
      'consoleLogCleaner.removeCurrentFile',
      () => removeConsoleLogsFromFileCommand(detectorEngine, fileService)
    ),
    vscode.commands.registerCommand(
      'consoleLogCleaner.removeWorkspace',
      () => removeConsoleLogsFromWorkspaceCommand(workspaceService)
    )
  );

  // Register Phase 2 Individual 18 Console Method Commands
  for (const method of CONSOLE_METHODS) {
    const capitalized = method.charAt(0).toUpperCase() + method.slice(1);
    const commandId = `consoleLogCleaner.remove${capitalized}`;

    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, () =>
        removeConsoleMethodCommand(detectorEngine, fileService, method as ConsoleMethod)
      )
    );
  }

  // Register Generic Cursor-Targeted Command
  context.subscriptions.push(
    vscode.commands.registerCommand('consoleLogCleaner.removeCurrentMethod', () =>
      removeConsoleMethodCommand(detectorEngine, fileService)
    )
  );

  // Register Phase 2 Bulk & Selection Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('consoleLogCleaner.removeEnabled', () =>
      removeEnabledMethodsCommand(detectorEngine, fileService)
    ),
    vscode.commands.registerCommand('consoleLogCleaner.removeAll', () =>
      removeAllMethodsCommand(detectorEngine, fileService)
    ),
    vscode.commands.registerCommand('consoleLogCleaner.removeFromSelection', () =>
      removeFromSelectionCommand(detectorEngine, fileService)
    )
  );

  Logger.info('Console Log Cleaner Phase 2 activated successfully.');
}

export function deactivate(): void {
  Logger.info('Console Log Cleaner extension deactivating...');
  Logger.dispose();
}
