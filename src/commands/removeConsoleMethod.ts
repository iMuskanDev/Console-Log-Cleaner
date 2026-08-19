import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { FileService } from '../services/fileService';
import { ConfigurationService } from '../services/configurationService';
import { PreviewService } from '../services/previewService';
import { ConsoleMethod, CONSOLE_METHODS } from '../console/consoleMethods';
import { isSupportedLanguage, isSupportedFileName } from '../utils/languageUtils';
import { isPositionInRange } from '../utils/rangeUtils';
import { Logger } from '../utils/logger';

export async function removeConsoleMethodCommand(
  detectorEngine: DetectorEngine,
  fileService: FileService,
  targetMethod?: ConsoleMethod
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

  const allDetections = detectorEngine.detectInDocument(document);
  if (allDetections.length === 0) {
    vscode.window.showInformationMessage('No console statements found in current file.');
    return;
  }

  // If a specific method was invoked (e.g. removeWarn or cursor targeted)
  let targetMethodToUse = targetMethod;
  const cursorPosition = editor.selection.start;

  // Check if cursor is directly over a console statement
  const cursorDetection = allDetections.find(d =>
    isPositionInRange(cursorPosition, d.range) ||
    (d.removalRange && isPositionInRange(cursorPosition, d.removalRange))
  );

  if (cursorDetection && !targetMethod) {
    targetMethodToUse = cursorDetection.method;
  }

  const methodToFilter = targetMethodToUse ?? 'log';
  const targetDetections = allDetections.filter(d => d.method === methodToFilter);

  if (targetDetections.length === 0) {
    vscode.window.showInformationMessage(`No console.${methodToFilter}() statements found in current file.`);
    return;
  }

  const config = ConfigurationService.getConfiguration();

  if (config.previewBeforeRemove) {
    const cleanedText = PreviewService.calculateCleanedText(document, targetDetections);
    const confirmed = await PreviewService.showDiffAndConfirm(
      document,
      cleanedText,
      `Preview Remove console.${methodToFilter}`
    );
    if (!confirmed) {
      return;
    }
  } else if (config.confirmBeforeRemoval) {
    const confirm = await vscode.window.showInformationMessage(
      `Found ${targetDetections.length} console.${methodToFilter}() statement(s). Remove them?`,
      { modal: false },
      'Remove',
      'Cancel'
    );
    if (confirm !== 'Remove') {
      return;
    }
  }

  const removedCount = await fileService.removeDetectionsFromFile(document, targetDetections);
  const message = `Removed ${removedCount} console.${methodToFilter}() statement(s).`;

  Logger.info(`removeConsoleMethodCommand (${methodToFilter}): ${message}`);

  if (config.showNotifications) {
    vscode.window.showInformationMessage(message);
  }
}
