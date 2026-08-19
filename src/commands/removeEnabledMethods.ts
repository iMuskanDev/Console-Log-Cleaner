import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { FileService } from '../services/fileService';
import { ConfigurationService } from '../services/configurationService';
import { PreviewService } from '../services/previewService';
import { isSupportedLanguage, isSupportedFileName } from '../utils/languageUtils';
import { Logger } from '../utils/logger';

export async function removeEnabledMethodsCommand(
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
    vscode.window.showInformationMessage(`Language "${document.languageId}" is not currently supported.`);
    return;
  }

  const config = ConfigurationService.getConfiguration();
  const enabledMethods = config.enabledMethods;

  const detections = detectorEngine.detectInDocument(document, enabledMethods);
  if (detections.length === 0) {
    vscode.window.showInformationMessage(`No enabled console statements (${enabledMethods.join(', ')}) found.`);
    return;
  }

  if (config.previewBeforeRemove) {
    const cleanedText = PreviewService.calculateCleanedText(document, detections);
    const confirmed = await PreviewService.showDiffAndConfirm(
      document,
      cleanedText,
      'Preview Remove Enabled Console Statements'
    );
    if (!confirmed) {
      return;
    }
  } else if (config.confirmBeforeRemoval) {
    const confirm = await vscode.window.showInformationMessage(
      `Found ${detections.length} enabled console statement(s). Remove them?`,
      { modal: false },
      'Remove',
      'Cancel'
    );
    if (confirm !== 'Remove') {
      return;
    }
  }

  const removedCount = await fileService.removeDetectionsFromFile(document, detections);
  const message = `Removed ${removedCount} enabled console statement(s).`;

  Logger.info(`removeEnabledMethodsCommand: ${message}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(message);
  }
}
