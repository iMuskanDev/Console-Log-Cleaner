import * as vscode from 'vscode';
import { DetectionResult } from '../../types/detection';
import { ConsoleMethod } from '../../console/consoleMethods';

export interface LanguageAdapter {
  readonly name: string;
  readonly supportedLanguageIds: readonly string[];
  readonly supportedExtensions: readonly string[];

  detect(
    sourceText: string,
    uri: vscode.Uri,
    languageId: string,
    targetMethods?: readonly ConsoleMethod[]
  ): DetectionResult[];

  calculateRemovalEdit(sourceText: string, result: DetectionResult): vscode.TextEdit;
}
