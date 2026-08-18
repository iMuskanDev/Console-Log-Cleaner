import * as vscode from 'vscode';
import { DetectorEngine } from '../detectors/detectorEngine';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';
import { isPositionInRange } from '../utils/rangeUtils';

export class ConsoleLogCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  private detectorEngine: DetectorEngine;
  private registry: LanguageRegistry;

  constructor() {
    this.registry = LanguageRegistry.getInstance();
    this.detectorEngine = new DetectorEngine(this.registry);
  }

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    if (!this.registry.isSupportedLanguage(document.languageId) &&
        !this.registry.isSupportedFile(document.fileName)) {
      return [];
    }

    const detections = this.detectorEngine.detectInDocument(document);
    if (detections.length === 0) {
      return [];
    }

    const cursorPosition = range.start;
    const targetedDetections = detections.filter(d =>
      isPositionInRange(cursorPosition, d.range) ||
      (d.removalRange && isPositionInRange(cursorPosition, d.removalRange))
    );

    if (targetedDetections.length === 0) {
      return [];
    }

    const adapter = this.registry.getAdapterForLanguage(document.languageId) ||
                    this.registry.getAdapterForFile(document.fileName);

    if (!adapter) {
      return [];
    }

    const sourceText = document.getText();
    const actions: vscode.CodeAction[] = [];

    for (const detection of targetedDetections) {
      const action = new vscode.CodeAction(
        'Remove console.log()',
        vscode.CodeActionKind.QuickFix
      );
      action.isPreferred = true;

      const edit = new vscode.WorkspaceEdit();
      const textEdit = adapter.calculateRemovalEdit(sourceText, detection);
      edit.replace(document.uri, textEdit.range, textEdit.newText);

      action.edit = edit;
      actions.push(action);
    }

    return actions;
  }
}
