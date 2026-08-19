import * as assert from 'assert';
import * as vscode from 'vscode';
import { CONSOLE_METHODS, ConsoleMethod } from '../console/consoleMethods';
import { TypeScriptDetector } from '../languages/javascript/TypeScriptDetector';
import { JavaScriptAdapter } from '../languages/javascript/JavaScriptAdapter';

describe('Phase 2 - 18 Console Methods & Selection Test Suite', () => {
  const uri = vscode.Uri.file('/mock/phase2.ts');
  const adapter = new JavaScriptAdapter();

  it('1. detects all 18 console methods correctly', () => {
    const code = CONSOLE_METHODS.map(m => `console.${m}("test ${m}");`).join('\n');
    const results = TypeScriptDetector.detectConsoleLogs(code, uri, 'typescript');
    assert.strictEqual(results.length, 18);

    const detectedMethods = new Set(results.map(r => r.method));
    for (const method of CONSOLE_METHODS) {
      assert.strictEqual(detectedMethods.has(method), true, `Method ${method} was not detected`);
    }
  });

  it('2. filters detection by target method', () => {
    const code = `console.log("log");\nconsole.warn("warn");\nconsole.error("error");`;
    const warnOnly = TypeScriptDetector.detectConsoleLogs(code, uri, 'typescript', ['warn']);
    assert.strictEqual(warnOnly.length, 1);
    assert.strictEqual(warnOnly[0].method, 'warn');
  });

  it('3. removes specific method without touching other methods', () => {
    const code = `const user = getUser();\nconsole.log(user);\nconsole.error("failed");`;
    const detections = adapter.detect(code, uri, 'typescript', ['log']);
    assert.strictEqual(detections.length, 1);

    const edit = adapter.calculateRemovalEdit(code, detections[0]);
    const startOffset = getOffset(code, edit.range.start);
    const endOffset = getOffset(code, edit.range.end);
    const result = code.slice(0, startOffset) + edit.newText + code.slice(endOffset);

    assert.ok(!result.includes('console.log'));
    assert.ok(result.includes('console.error("failed")'));
  });

  it('4. ignores comments and strings containing console.warn or console.error', () => {
    const code = `// console.warn("fake");\nconst text = "console.error('fake')";\nconsole.error("real");`;
    const detections = adapter.detect(code, uri, 'typescript');
    assert.strictEqual(detections.length, 1);
    assert.strictEqual(detections[0].method, 'error');
  });

  it('5. handles console.time / console.timeEnd paired calls', () => {
    const code = `console.time("fetch");\nfetch();\nconsole.timeEnd("fetch");`;
    const detections = adapter.detect(code, uri, 'typescript');
    assert.strictEqual(detections.length, 2);
  });
});

function getOffset(text: string, pos: vscode.Position): number {
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
