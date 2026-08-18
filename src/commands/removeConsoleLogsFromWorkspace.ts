import * as vscode from 'vscode';
import { WorkspaceService } from '../services/workspaceService';
import { StatisticsService } from '../services/statisticsService';
import { ConfigurationService } from '../services/configurationService';
import { Logger } from '../utils/logger';

export async function removeConsoleLogsFromWorkspaceCommand(workspaceService: WorkspaceService): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showInformationMessage('No open workspace folder found.');
    return;
  }

  const scanResult = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Console Log Cleaner: Scanning workspace...',
      cancellable: false
    },
    async (progress) => {
      return await workspaceService.scanWorkspace(progress);
    }
  );

  if (scanResult.totalStatements === 0) {
    vscode.window.showInformationMessage('No console.log() statements found in the workspace.');
    return;
  }

  const config = ConfigurationService.getConfiguration();

  if (config.confirmBeforeRemoval) {
    const confirm = await vscode.window.showInformationMessage(
      `Console Log Cleaner\n\nFound ${scanResult.totalStatements} console.log() statement(s) across ${scanResult.totalFiles} file(s). Remove them?`,
      { modal: true },
      'Remove All',
      'Cancel'
    );

    if (confirm !== 'Remove All') {
      return;
    }
  }

  const { removedStatements, modifiedFiles } = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Console Log Cleaner: Removing console.log() statements...',
      cancellable: false
    },
    async (progress) => {
      return await workspaceService.removeDetectionsFromWorkspace(scanResult, progress);
    }
  );

  const summary = StatisticsService.formatRemovalSummary(removedStatements, modifiedFiles);
  Logger.info(`removeConsoleLogsFromWorkspace: ${summary}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(summary);
  }
}
