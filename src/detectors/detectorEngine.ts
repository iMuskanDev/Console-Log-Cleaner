import * as vscode from 'vscode';
import { DetectionResult } from '../types/detection';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';
import { ConsoleMethod } from '../console/consoleMethods';
import { Logger } from '../utils/logger';

export class DetectorEngine {
  private registry: LanguageRegistry;

  constructor(registry?: LanguageRegistry) {
    this.registry = registry ?? LanguageRegistry.getInstance();
  }

  public detectInText(
    sourceText: string,
    uri: vscode.Uri,
    languageId: string,
    targetMethods?: readonly ConsoleMethod[]
  ): DetectionResult[] {
    const adapter = this.registry.getAdapterForLanguage(languageId) ||
                    this.registry.getAdapterForFile(uri.fsPath);

    if (!adapter) {
      Logger.debug(`No language adapter registered for languageId "${languageId}" or file "${uri.fsPath}"`);
      return [];
    }

    try {
      return adapter.detect(sourceText, uri, languageId, targetMethods);
    } catch (err) {
      Logger.error(`Error executing detection on ${uri.fsPath}`, err);
      return [];
    }
  }

  public detectInDocument(
    document: vscode.TextDocument,
    targetMethods?: readonly ConsoleMethod[]
  ): DetectionResult[] {
    const text = document.getText();
    return this.detectInText(text, document.uri, document.languageId, targetMethods);
  }
}
