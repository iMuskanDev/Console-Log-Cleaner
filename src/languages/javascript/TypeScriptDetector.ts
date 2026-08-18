import * as ts from 'typescript';
import * as vscode from 'vscode';
import { DetectionResult } from '../../types/detection';
import { createRangeFromOffsets } from '../../utils/rangeUtils';
import { RemovalStrategy } from '../core/RemovalStrategy';

export class TypeScriptDetector {
  /**
   * Parses JavaScript/TypeScript source code using TypeScript Compiler API (AST)
   * and returns structured DetectionResult items for console.log() statements.
   */
  public static detectConsoleLogs(
    sourceText: string,
    uri: vscode.Uri,
    languageId: string
  ): DetectionResult[] {
    const results: DetectionResult[] = [];
    const scriptKind = TypeScriptDetector.getScriptKind(languageId, uri.fsPath);

    let sourceFile: ts.SourceFile;
    try {
      sourceFile = ts.createSourceFile(
        uri.fsPath || 'file.ts',
        sourceText,
        ts.ScriptTarget.Latest,
        true, // setParentNodes
        scriptKind
      );
    } catch (err) {
      // If parsing fails completely due to malformed source, return empty results safely
      return results;
    }

    let detectionCounter = 0;

    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        if (TypeScriptDetector.isTargetConsoleLogCall(node)) {
          detectionCounter++;
          const targetNode = ts.isExpressionStatement(node.parent) ? node.parent : node;

          const startOffset = targetNode.getStart(sourceFile);
          const endOffset = targetNode.getEnd();

          const startLineChar = sourceFile.getLineAndCharacterOfPosition(startOffset);
          const endLineChar = sourceFile.getLineAndCharacterOfPosition(endOffset);

          const range = new vscode.Range(
            new vscode.Position(startLineChar.line, startLineChar.character),
            new vscode.Position(endLineChar.line, endLineChar.character)
          );

          const removalRange = RemovalStrategy.calculateSafeRange(
            sourceText,
            startOffset,
            endOffset
          );

          const matchedText = sourceText.substring(startOffset, endOffset);

          results.push({
            id: `console-log-${uri.fsPath}-${startOffset}-${detectionCounter}`,
            type: 'console.log',
            languageId,
            uri,
            range,
            line: startLineChar.line + 1, // 1-indexed
            sourceText: matchedText,
            confidence: 1.0,
            removalRange
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return results;
  }

  /**
   * Strict identification of console.log(...) CallExpressions.
   * Rejects window.console.log, globalThis.console.log, console["log"], obj.console.log, c.log, etc.
   */
  private static isTargetConsoleLogCall(node: ts.CallExpression): boolean {
    const expr = node.expression;

    // Must be a property access expression (console.log)
    if (!ts.isPropertyAccessExpression(expr)) {
      return false;
    }

    // Left identifier MUST be 'console'
    if (!ts.isIdentifier(expr.expression) || expr.expression.text !== 'console') {
      return false;
    }

    // Property name MUST be 'log'
    if (!ts.isIdentifier(expr.name) || expr.name.text !== 'log') {
      return false;
    }

    return true;
  }

  private static getScriptKind(languageId: string, filePath: string): ts.ScriptKind {
    const lower = filePath.toLowerCase();
    if (languageId === 'typescriptreact' || lower.endsWith('.tsx')) {
      return ts.ScriptKind.TSX;
    }
    if (languageId === 'typescript' || lower.endsWith('.ts')) {
      return ts.ScriptKind.TS;
    }
    if (languageId === 'javascriptreact' || lower.endsWith('.jsx')) {
      return ts.ScriptKind.JSX;
    }
    return ts.ScriptKind.JS;
  }
}
