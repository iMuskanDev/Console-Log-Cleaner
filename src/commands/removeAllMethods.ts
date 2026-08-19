import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { FileService } from '../services/fileService';
import { ConfigurationService } from '../services/configurationService';
import { PreviewService } from '../services/previewService';
import { isSupportedLanguage, isSupportedFileName } from '../utils/languageUtils';
import { Logger } from '../utils/logger';

export async function removeAllMethodsCommand(
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

  const detections = detectorEngine.detectInDocument(document);
  if (detections.length === 0) {
    vscode.window.showInformationMessage('No console statements found in current file.');
    return;
  }

  const config = ConfigurationService.getConfiguration();

  if (config.previewBeforeRemove) {
    const cleanedText = PreviewService.calculateCleanedText(document, detections);
    const confirmed = await PreviewService.showDiffAndConfirm(
      document,
      cleanedText,
      'Preview Remove All Console Statements'
    );
    if (!confirmed) {
      return;
    }
  } else if (config.confirmBeforeRemoval) {
    const confirm = await vscode.window.showInformationMessage(
      `Found ${detections.length} console statement(s) of all types. Remove them all?`,
      { modal: false },
      'Remove All',
      'Cancel'
    );
    if (confirm !== 'Remove All') {
      return;
    }
  }

  const removedCount = await fileService.removeDetectionsFromFile(document, detections);
  const message = `Removed ${removedCount} console statement(s) of all types from ${document.fileName.split('/').pop()}.`;

  Logger.info(`removeAllMethodsCommand: ${message}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(message);
  }
}
