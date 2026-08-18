import * as assert from 'assert';
import * as vscode from 'vscode';
import { JavaScriptAdapter } from '../languages/javascript/JavaScriptAdapter';

function applyDetectionsAndRemove(code: string, languageId = 'typescript', fileName = '/mock/test.ts'): string {
  const uri = vscode.Uri.file(fileName);
  const adapter = new JavaScriptAdapter();
  const detections = adapter.detect(code, uri, languageId);

  if (detections.length === 0) {
    return code;
  }

  // Sort detections in reverse order to apply text edits safely
  const sorted = [...detections].sort((a, b) => b.range.start.compareTo(a.range.start));
  let result = code;

  for (const detection of sorted) {
    const edit = adapter.calculateRemovalEdit(result, detection);
    const startOffset = getOffsetFromPosition(result, edit.range.start);
    const endOffset = getOffsetFromPosition(result, edit.range.end);
    result = result.slice(0, startOffset) + edit.newText + result.slice(endOffset);
  }

  return result;
}

function getOffsetFromPosition(text: string, pos: vscode.Position): number {
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

describe('RemovalStrategy Unit Tests', () => {
  it('1. removes simple console.log cleanly leaving adjacent statements intact', () => {
    const input = `const a = 5;\nconsole.log(a);\nconst b = 10;`;
    const expected = `const a = 5;\nconst b = 10;`;
    assert.strictEqual(applyDetectionsAndRemove(input), expected);
  });

  it('2. preserves commented console.log', () => {
    const input = `const a = 5;\n// console.log("debug", a);\nconst b = 10;`;
    assert.strictEqual(applyDetectionsAndRemove(input), input);
  });

  it('3. removes multiline console.log cleanly', () => {
    const input = `function test() {\n    console.log(\n        "line 1",\n        "line 2"\n    );\n    return true;\n}`;
    const expected = `function test() {\n    return true;\n}`;
    assert.strictEqual(applyDetectionsAndRemove(input), expected);
  });

  it('4. preserves indentation of surrounding code', () => {
    const input = `function calculate() {\n    const x = 10;\n    console.log("x =", x);\n    return x * 2;\n}`;
    const expected = `function calculate() {\n    const x = 10;\n    return x * 2;\n}`;
    assert.strictEqual(applyDetectionsAndRemove(input), expected);
  });

  it('5. handles multiple removals in same file without offsetting errors', () => {
    const input = `console.log(1);\nconst a = 1;\nconsole.log(2);\nconst b = 2;\nconsole.log(3);`;
    const expected = `const a = 1;\nconst b = 2;`;
    assert.strictEqual(applyDetectionsAndRemove(input), expected);
  });

  it('6. handles CRLF line endings cleanly', () => {
    const input = `const a = 1;\r\nconsole.log(a);\r\nconst b = 2;`;
    const result = applyDetectionsAndRemove(input);
    assert.ok(!result.includes('console.log(a)'));
  });
});
