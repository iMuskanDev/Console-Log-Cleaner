import * as assert from 'assert';
import * as vscode from 'vscode';
import { JavaScriptAdapter } from '../languages/javascript/JavaScriptAdapter';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';

describe('Console Log Cleaner Integration & Unit Test Suite', () => {
  let adapter: JavaScriptAdapter;

  beforeEach(() => {
    adapter = new JavaScriptAdapter();
    const registry = LanguageRegistry.getInstance();
    registry.clear();
    registry.registerAdapter(adapter);
  });

  it('verifies LanguageRegistry lookup for JS/TS extensions', () => {
    const registry = LanguageRegistry.getInstance();
    assert.strictEqual(registry.isSupportedFile('app.ts'), true);
    assert.strictEqual(registry.isSupportedFile('Component.tsx'), true);
    assert.strictEqual(registry.isSupportedFile('script.js'), true);
    assert.strictEqual(registry.isSupportedFile('View.jsx'), true);
    assert.strictEqual(registry.isSupportedFile('notes.txt'), false);
  });

  it('verifies AST detection ignores string literals containing console.log', () => {
    const source = `const query = "SELECT * FROM logs WHERE text = 'console.log'";`;
    const uri = vscode.Uri.file('/mock/query.js');
    const detections = adapter.detect(source, uri, 'javascript');
    assert.strictEqual(detections.length, 0);
  });

  it('verifies AST detection ignores comments containing console.log', () => {
    const source = `// TODO: console.log("fix me");`;
    const uri = vscode.Uri.file('/mock/todo.js');
    const detections = adapter.detect(source, uri, 'javascript');
    assert.strictEqual(detections.length, 0);
  });

  it('verifies detection of console.log inside React JSX component', () => {
    const source = `import React from 'react';\nexport const Btn = () => {\n  console.log("rendering");\n  return <button>Click</button>;\n};`;
    const uri = vscode.Uri.file('/mock/Btn.jsx');
    const detections = adapter.detect(source, uri, 'javascriptreact');
    assert.strictEqual(detections.length, 1);
  });
});
