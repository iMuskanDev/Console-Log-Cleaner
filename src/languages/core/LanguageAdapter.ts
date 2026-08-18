import * as vscode from 'vscode';
import { DetectionResult } from '../../types/detection';

/**
 * Interface contract for language adapters.
 * Language-specific parsing, detection, and removal logic must implement this interface.
 * Core extension engines depend ONLY on this contract, keeping core logic completely decoupled.
 */
export interface LanguageAdapter {
  /**
   * Unique name of the language adapter (e.g. 'JavaScript/TypeScript').
   */
  readonly name: string;

  /**
   * List of VS Code language IDs supported by this adapter.
   */
  readonly supportedLanguageIds: readonly string[];

  /**
   * List of file extensions supported by this adapter.
   */
  readonly supportedExtensions: readonly string[];

  /**
   * Parses source text and detects target logging statements (e.g. console.log).
   *
   * @param sourceText Raw file source code content
   * @param uri File URI for location reporting
   * @param languageId VS Code language ID of document
   */
  detect(sourceText: string, uri: vscode.Uri, languageId: string): DetectionResult[];

  /**
   * Calculates the exact TextEdit replacement range required for clean removal.
   *
   * @param sourceText Full source text
   * @param result Detection item to calculate removal for
   */
  calculateRemovalEdit(sourceText: string, result: DetectionResult): vscode.TextEdit;
}
