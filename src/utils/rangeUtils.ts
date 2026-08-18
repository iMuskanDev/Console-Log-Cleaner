import * as vscode from 'vscode';

/**
 * Helper utilities for working with VS Code Range and Position instances.
 */
export function isPositionInRange(position: vscode.Position, range: vscode.Range): boolean {
  return range.contains(position);
}

export function createRangeFromOffsets(
  documentText: string,
  startOffset: number,
  endOffset: number,
  document?: vscode.TextDocument
): vscode.Range {
  if (document) {
    return new vscode.Range(
      document.positionAt(startOffset),
      document.positionAt(endOffset)
    );
  }

  // Pure string offset-to-position calculator for standalone testing without VS Code extension runtime
  let currentLine = 0;
  let currentCol = 0;
  let startPos: vscode.Position | null = null;
  let endPos: vscode.Position | null = null;

  for (let i = 0; i <= documentText.length; i++) {
    if (i === startOffset) {
      startPos = new vscode.Position(currentLine, currentCol);
    }
    if (i === endOffset) {
      endPos = new vscode.Position(currentLine, currentCol);
      break;
    }

    if (i < documentText.length) {
      if (documentText[i] === '\n') {
        currentLine++;
        currentCol = 0;
      } else {
        currentCol++;
      }
    }
  }

  if (!startPos) {
    startPos = new vscode.Position(0, 0);
  }
  if (!endPos) {
    endPos = startPos;
  }

  return new vscode.Range(startPos, endPos);
}
