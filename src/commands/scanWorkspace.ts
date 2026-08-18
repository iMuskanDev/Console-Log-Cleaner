import * as vscode from 'vscode';
import { WorkspaceService } from '../services/workspaceService';
import { StatisticsService } from '../services/statisticsService';
import { ConfigurationService } from '../services/configurationService';
import { Logger } from '../utils/logger';

export async function scanWorkspaceCommand(workspaceService: WorkspaceService): Promise<void> {
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

  const summary = StatisticsService.formatScanSummary(scanResult);
  Logger.info(`scanWorkspace: ${summary}`);

  const config = ConfigurationService.getConfiguration();
  if (config.showNotifications) {
    vscode.window.showInformationMessage(summary);
  }
}
