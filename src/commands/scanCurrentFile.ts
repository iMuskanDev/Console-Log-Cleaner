import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { ConfigurationService } from '../services/configurationService';
import { isSupportedLanguage, isSupportedFileName } from '../utils/languageUtils';
import { Logger } from '../utils/logger';

export async function scanCurrentFileCommand(detectorEngine: DetectorEngine): Promise<void> {
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
  const config = ConfigurationService.getConfiguration();

  const count = detections.length;
  const message = count === 0
    ? 'No console.log() statements found in current file.'
    : `Found ${count} console.log() ${count === 1 ? 'statement' : 'statements'} in current file.`;

  Logger.info(`scanCurrentFile: ${message}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(message);
  }
}
