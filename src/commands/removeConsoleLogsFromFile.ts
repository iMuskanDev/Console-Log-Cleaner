import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { FileService } from '../services/fileService';
import { ConfigurationService } from '../services/configurationService';
import { isSupportedLanguage, isSupportedFileName } from '../utils/languageUtils';
import { Logger } from '../utils/logger';

export async function removeConsoleLogsFromFileCommand(
  detectorEngine: DetectorEngine,
  fileService: FileService
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('No active editor found.');
    return;
  }

  const document = editor.document;
  if (!isSupportedLanguage(document.languageId) && !isSupportedFileName(document.fileName)) {
    vscode.window.showInformationMessage(`Language "${document.languageId}" is not currently supported for console.log cleaner.`);
    return;
  }

  const detections = detectorEngine.detectInDocument(document);
  if (detections.length === 0) {
    vscode.window.showInformationMessage('No console.log() statements found in current file.');
    return;
  }

  const config = ConfigurationService.getConfiguration();

  if (config.confirmBeforeRemoval) {
    const confirm = await vscode.window.showInformationMessage(
      `Found ${detections.length} console.log() statement(s). Remove them?`,
      { modal: false },
      'Remove',
      'Cancel'
    );

    if (confirm !== 'Remove') {
      return;
    }
  }

  const removedCount = await fileService.removeDetectionsFromFile(document, detections);
  const message = `Removed ${removedCount} console.log() ${removedCount === 1 ? 'statement' : 'statements'} from ${document.fileName.split('/').pop()}.`;

  Logger.info(`removeConsoleLogsFromFile: ${message}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(message);
  }
}
