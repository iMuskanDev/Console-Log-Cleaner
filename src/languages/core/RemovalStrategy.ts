import * as vscode from 'vscode';
import { DetectionResult } from '../../types/detection';
import { createRangeFromOffsets } from '../../utils/rangeUtils';

export class RemovalStrategy {
  /**
   * Calculates the exact TextEdit to safely remove a detected statement from source text.
   * Preserves formatting, surrounding code, indentation, and line breaks cleanly.
   */
  public static calculateTextEdit(
    sourceText: string,
    result: DetectionResult
  ): vscode.TextEdit {
    const { range } = result;

    if (result.removalRange) {
      return vscode.TextEdit.delete(result.removalRange);
    }

    const startOffset = RemovalStrategy.getOffsetFromPosition(sourceText, range.start);
    const endOffset = RemovalStrategy.getOffsetFromPosition(sourceText, range.end);

    const safeRange = RemovalStrategy.calculateSafeRange(sourceText, startOffset, endOffset);
    return vscode.TextEdit.delete(safeRange);
  }

  /**
   * Analyzes line context surrounding [startOffset, endOffset] to calculate
   * a range that consumes leading indentation and trailing line break if the statement is alone on its line.
   */
  public static calculateSafeRange(
    text: string,
    startOffset: number,
    endOffset: number
  ): vscode.Range {
    // Check optional trailing semicolon
    let actualEnd = endOffset;
    if (actualEnd < text.length && text[actualEnd] === ';') {
      actualEnd++;
    }

    // Find start of current line
    let lineStart = startOffset;
    while (lineStart > 0 && text[lineStart - 1] !== '\n' && text[lineStart - 1] !== '\r') {
      lineStart--;
    }

    // Check if prefix before startOffset is only whitespace
    const leadingText = text.slice(lineStart, startOffset);
    const isLeadingOnlyWhitespace = /^[ \t]*$/.test(leadingText);

    // Scan forward for trailing horizontal spaces/tabs
    let trailingIndex = actualEnd;
    while (trailingIndex < text.length && (text[trailingIndex] === ' ' || text[trailingIndex] === '\t')) {
      trailingIndex++;
    }

    // Check if trailing text reaches end of line or end of file
    let isTrailingOnlyWhitespace = false;
    let newlineLength = 0;

    if (trailingIndex >= text.length) {
      isTrailingOnlyWhitespace = true;
    } else if (text[trailingIndex] === '\r') {
      if (trailingIndex + 1 < text.length && text[trailingIndex + 1] === '\n') {
        newlineLength = 2;
      } else {
        newlineLength = 1;
      }
      isTrailingOnlyWhitespace = true;
    } else if (text[trailingIndex] === '\n') {
      newlineLength = 1;
      isTrailingOnlyWhitespace = true;
    }

    if (isLeadingOnlyWhitespace && isTrailingOnlyWhitespace) {
      let finalStart = lineStart;
      let finalEnd = trailingIndex + newlineLength;

      // If statement is at the end of text with no trailing newline, consume preceding newline
      if (trailingIndex >= text.length && newlineLength === 0 && finalStart > 0) {
        if (text[finalStart - 1] === '\n') {
          finalStart--;
          if (finalStart > 0 && text[finalStart - 1] === '\r') {
            finalStart--;
          }
        }
      }

      return createRangeFromOffsets(text, finalStart, finalEnd);
    } else {
      return createRangeFromOffsets(text, startOffset, trailingIndex);
    }
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
