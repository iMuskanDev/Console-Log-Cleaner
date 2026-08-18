import * as vscode from 'vscode';
import { DetectionResult } from '../types/detection';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';
import { Logger } from '../utils/logger';

export class DetectorEngine {
  private registry: LanguageRegistry;

  constructor(registry?: LanguageRegistry) {
    this.registry = registry ?? LanguageRegistry.getInstance();
  }

  /**
   * Detects logging statements in source text using the appropriate LanguageAdapter.
   */
  public detectInText(
    sourceText: string,
    uri: vscode.Uri,
    languageId: string
  ): DetectionResult[] {
    const adapter = this.registry.getAdapterForLanguage(languageId) ||
                    this.registry.getAdapterForFile(uri.fsPath);

    if (!adapter) {
      Logger.debug(`No language adapter registered for languageId "${languageId}" or file "${uri.fsPath}"`);
      return [];
    }

    try {
      return adapter.detect(sourceText, uri, languageId);
    } catch (err) {
      Logger.error(`Error executing detection on ${uri.fsPath}`, err);
      return [];
    }
  }

  /**
   * Detects logging statements in a open VS Code TextDocument.
   */
  public detectInDocument(document: vscode.TextDocument): DetectionResult[] {
    const text = document.getText();
    return this.detectInText(text, document.uri, document.languageId);
  }
}
