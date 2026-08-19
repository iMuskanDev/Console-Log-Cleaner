import * as ts from 'typescript';
import * as vscode from 'vscode';
import { DetectionResult } from '../../types/detection';
import { ConsoleMethod, isConsoleMethod } from '../../console/consoleMethods';
import { RemovalStrategy } from '../core/RemovalStrategy';

export class TypeScriptDetector {
  /**
   * Parses JavaScript/TypeScript source code using TypeScript Compiler API (AST)
   * and returns structured DetectionResult items for target console methods.
   *
   * @param sourceText Source code text
   * @param uri Document URI
   * @param languageId Language ID
   * @param targetMethods Optional list of specific ConsoleMethods to target. If omitted, matches all 18 methods.
   */
  public static detectConsoleLogs(
    sourceText: string,
    uri: vscode.Uri,
    languageId: string,
    targetMethods?: readonly ConsoleMethod[]
  ): DetectionResult[] {
    const results: DetectionResult[] = [];
    const scriptKind = TypeScriptDetector.getScriptKind(languageId, uri.fsPath);
    const methodFilter = targetMethods ? new Set(targetMethods) : null;

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
      return results;
    }

    let detectionCounter = 0;

    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        const method = TypeScriptDetector.getConsoleMethodName(node);
        if (method && (!methodFilter || methodFilter.has(method))) {
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
            id: `console-${method}-${uri.fsPath}-${startOffset}-${detectionCounter}`,
            type: `console.${method}`,
            method,
            languageId,
            uri,
            range,
            line: startLineChar.line + 1,
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
   * Identifies if node is a console.<method>(...) call and returns method name.
   * Rejects window.console.log, globalThis.console.log, console["log"], obj.console.log, etc.
   */
  private static getConsoleMethodName(node: ts.CallExpression): ConsoleMethod | null {
    const expr = node.expression;

    if (!ts.isPropertyAccessExpression(expr)) {
      return null;
    }

    if (!ts.isIdentifier(expr.expression) || expr.expression.text !== 'console') {
      return null;
    }

    if (!ts.isIdentifier(expr.name)) {
      return null;
    }

    const methodName = expr.name.text;
    if (isConsoleMethod(methodName)) {
      return methodName;
    }

    return null;
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
