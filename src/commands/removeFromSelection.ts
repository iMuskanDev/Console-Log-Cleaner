import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { FileService } from '../services/fileService';
import { ConfigurationService } from '../services/configurationService';
import { PreviewService } from '../services/previewService';
import { isSupportedLanguage, isSupportedFileName } from '../utils/languageUtils';
import { isPositionInRange } from '../utils/rangeUtils';
import { Logger } from '../utils/logger';

export async function removeFromSelectionCommand(
  detectorEngine: DetectorEngine,
  fileService: FileService
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('No active editor found.');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showInformationMessage('No text selected. Please select a block of code first.');
    return;
  }

  const document = editor.document;
  if (!isSupportedLanguage(document.languageId) && !isSupportedFileName(document.fileName)) {
    vscode.window.showInformationMessage(`Language "${document.languageId}" is not currently supported.`);
    return;
  }

  const allDetections = detectorEngine.detectInDocument(document);

  // Filter detections intersecting selection range
  const selectionDetections = allDetections.filter(d => {
    return d.range.intersection(selection) !== undefined ||
           (d.removalRange && d.removalRange.intersection(selection) !== undefined);
  });

  if (selectionDetections.length === 0) {
    vscode.window.showInformationMessage('No console statements found within selected code.');
    return;
  }

  const config = ConfigurationService.getConfiguration();

  if (config.previewBeforeRemove) {
    const cleanedText = PreviewService.calculateCleanedText(document, selectionDetections);
    const confirmed = await PreviewService.showDiffAndConfirm(
      document,
      cleanedText,
      'Preview Remove Console Statements From Selection'
    );
    if (!confirmed) {
      return;
    }
  } else if (config.confirmBeforeRemoval) {
    const confirm = await vscode.window.showInformationMessage(
      `Found ${selectionDetections.length} console statement(s) in selection. Remove them?`,
      { modal: false },
      'Remove',
      'Cancel'
    );
    if (confirm !== 'Remove') {
      return;
    }
  }

  const removedCount = await fileService.removeDetectionsFromFile(document, selectionDetections);
  const message = `Removed ${removedCount} console statement(s) from selection.`;

  Logger.info(`removeFromSelectionCommand: ${message}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(message);
  }
}
