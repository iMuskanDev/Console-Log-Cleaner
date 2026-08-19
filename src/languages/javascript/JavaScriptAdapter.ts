import * as vscode from 'vscode';
import { LanguageAdapter } from '../core/LanguageAdapter';
import { DetectionResult } from '../../types/detection';
import { TypeScriptDetector } from './TypeScriptDetector';
import { RemovalStrategy } from '../core/RemovalStrategy';
import { ConsoleMethod } from '../../console/consoleMethods';

export class JavaScriptAdapter implements LanguageAdapter {
  public readonly name = 'JavaScript/TypeScript Adapter';

  public readonly supportedLanguageIds = [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact'
  ] as const;

  public readonly supportedExtensions = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.mjs',
    '.cjs'
  ] as const;

  public detect(
    sourceText: string,
    uri: vscode.Uri,
    languageId: string,
    targetMethods?: readonly ConsoleMethod[]
  ): DetectionResult[] {
    return TypeScriptDetector.detectConsoleLogs(sourceText, uri, languageId, targetMethods);
  }

  public calculateRemovalEdit(
    sourceText: string,
    result: DetectionResult
  ): vscode.TextEdit {
    return RemovalStrategy.calculateTextEdit(sourceText, result);
  }
}
