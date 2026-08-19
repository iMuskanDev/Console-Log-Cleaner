import * as vscode from 'vscode';
import { ConsoleMethod } from '../console/consoleMethods';

export type StatementType = `console.${ConsoleMethod}` | 'console.log' | ConsoleMethod;

export interface DetectionResult {
  /**
   * Unique identifier for this detection instance.
   */
  id: string;

  /**
   * Detected statement method name (e.g. 'log', 'info', 'warn', 'error').
   */
  type: StatementType;

  /**
   * Specific console method name.
   */
  method: ConsoleMethod;

  /**
   * VS Code language ID of source file.
   */
  languageId: string;

  /**
   * Target document URI.
   */
  uri: vscode.Uri;

  /**
   * VS Code range of the detected statement.
   */
  range: vscode.Range;

  /**
   * 1-indexed line number where detection begins.
   */
  line: number;

  /**
   * Raw source snippet of the matched statement.
   */
  sourceText: string;

  /**
   * Detection confidence score between 0.0 and 1.0.
   */
  confidence: number;

  /**
   * Complete range to replace when removing statement (including line breaks/semicolon).
   */
  removalRange?: vscode.Range;
}

export interface WorkspaceScanResult {
  totalStatements: number;
  totalFiles: number;
  fileDetections: Map<string, DetectionResult[]>;
}
