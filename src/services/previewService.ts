import * as vscode from 'vscode';
import { DetectionResult } from '../types/detection';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';
import { Logger } from '../utils/logger';

export class PreviewService {
  private static readonly SCHEME = 'console-log-cleaner-preview';
  private static registeredProvider: vscode.Disposable | null = null;
  private static contentMap = new Map<string, string>();
  private static onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

  public static initialize(context: vscode.ExtensionContext): void {
    if (PreviewService.registeredProvider) {
      return;
    }

    const provider: vscode.TextDocumentContentProvider = {
      onDidChange: PreviewService.onDidChangeEmitter.event,
      provideTextDocumentContent(uri: vscode.Uri): string {
        return PreviewService.contentMap.get(uri.toString()) ?? '';
      }
    };

    PreviewService.registeredProvider = vscode.workspace.registerTextDocumentContentProvider(
      PreviewService.SCHEME,
      provider
    );

    context.subscriptions.push(PreviewService.registeredProvider);
  }

  /**
   * Calculates modified document text by applying removal edits to source text.
   */
  public static calculateCleanedText(
    document: vscode.TextDocument,
    detections: DetectionResult[]
  ): string {
    const registry = LanguageRegistry.getInstance();
    const adapter = registry.getAdapterForLanguage(document.languageId) ||
                    registry.getAdapterForFile(document.fileName);

    if (!adapter || detections.length === 0) {
      return document.getText();
    }

    let result = document.getText();
    const sorted = [...detections].sort((a, b) => b.range.start.compareTo(a.range.start));

    for (const detection of sorted) {
      const textEdit = adapter.calculateRemovalEdit(result, detection);
      const startOffset = PreviewService.getOffsetFromPosition(result, textEdit.range.start);
      const endOffset = PreviewService.getOffsetFromPosition(result, textEdit.range.end);
      result = result.slice(0, startOffset) + textEdit.newText + result.slice(endOffset);
    }

    return result;
  }

  /**
   * Opens side-by-side diff preview comparing original vs cleaned code.
   * Prompts user to confirm applying changes.
   */
  public static async showDiffAndConfirm(
    document: vscode.TextDocument,
    cleanedText: string,
    title = 'Console Log Removal Preview'
  ): Promise<boolean> {
    const previewUri = vscode.Uri.parse(
      `${PreviewService.SCHEME}://${document.uri.path}?cleaned-${Date.now()}`
    );

    PreviewService.contentMap.set(previewUri.toString(), cleanedText);
    PreviewService.onDidChangeEmitter.fire(previewUri);

    try {
      await vscode.commands.executeCommand(
        'vscode.diff',
        document.uri,
        previewUri,
        `${title}: ${document.fileName.split('/').pop()}`
      );
    } catch (err) {
      Logger.error('Failed to open diff preview window', err);
    }

    const answer = await vscode.window.showInformationMessage(
      `Preview removal of console statements for ${document.fileName.split('/').pop()}?`,
      { modal: true },
      'Apply Removal',
      'Cancel'
    );

    PreviewService.contentMap.delete(previewUri.toString());
    return answer === 'Apply Removal';
  }

  private static getOffsetFromPosition(text: string, pos: vscode.Position): number {
    let line = 0;
    let col = 0;
    for (let i = 0; i < text.length; i++) {
      if (line === pos.line && col === pos.character) {
        return i;
      }
      if (text[i] === '\n') {
        if (line === pos.line) {
          return i;
        }
        line++;
        col = 0;
      } else {
        col++;
      }
    }
    return text.length;
  }
}
