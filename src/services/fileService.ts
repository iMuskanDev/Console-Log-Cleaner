import * as vscode from 'vscode';
import { DetectionResult } from '../types/detection';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';
import { Logger } from '../utils/logger';

export class FileService {
  private registry: LanguageRegistry;

  constructor() {
    this.registry = LanguageRegistry.getInstance();
  }

  /**
   * Applies removal edits for a list of detections within a single text document.
   * Returns total count of statements removed.
   */
  public async removeDetectionsFromFile(
    document: vscode.TextDocument,
    detections: DetectionResult[]
  ): Promise<number> {
    if (detections.length === 0) {
      return 0;
    }

    const adapter = this.registry.getAdapterForLanguage(document.languageId) ||
                    this.registry.getAdapterForFile(document.fileName);

    if (!adapter) {
      Logger.warn(`No language adapter available for file ${document.fileName}`);
      return 0;
    }

    const sourceText = document.getText();

    // Sort detections in reverse offset order so edits don't invalidate subsequent line positions
    const sortedDetections = [...detections].sort((a, b) => b.range.start.compareTo(a.range.start));

    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const detection of sortedDetections) {
      const textEdit = adapter.calculateRemovalEdit(sourceText, detection);
      workspaceEdit.replace(document.uri, textEdit.range, textEdit.newText);
    }

    const success = await vscode.workspace.applyEdit(workspaceEdit);
    if (success) {
      Logger.info(`Successfully applied WorkspaceEdit removing ${detections.length} statement(s) from ${document.fileName}`);
      return detections.length;
    } else {
      Logger.error(`Failed to apply WorkspaceEdit for ${document.fileName}`);
      return 0;
    }
  }

  /**
   * Reads file source text safely by URI.
   */
  public async readDocumentText(uri: vscode.Uri): Promise<{ document?: vscode.TextDocument; text: string } | null> {
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      return { document, text: document.getText() };
    } catch (err) {
      Logger.error(`Failed to read document at ${uri.fsPath}`, err);
      return null;
    }
  }
}
