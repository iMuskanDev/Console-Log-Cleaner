import * as assert from 'assert';
import * as vscode from 'vscode';
import { TypeScriptDetector } from '../../languages/javascript/TypeScriptDetector';
import { JavaScriptAdapter } from '../../languages/javascript/JavaScriptAdapter';

describe('Extension Test Suite', () => {
    const uri = vscode.Uri.file('/mock/test.ts');
    const adapter = new JavaScriptAdapter();

    it('detects console.log in TS code', () => {
        const input = `const a = 5;\nconsole.log(a);\nconst b = 10;`;
        const detections = TypeScriptDetector.detectConsoleLogs(input, uri, 'typescript');
        assert.strictEqual(detections.length, 1);
        assert.strictEqual(detections[0].line, 2);
    });

    it('does NOT remove commented console.log', () => {
        const input = `const a = 5;\n// console.log("debug", a);\nconst b = 10;`;
        const detections = TypeScriptDetector.detectConsoleLogs(input, uri, 'typescript');
        assert.strictEqual(detections.length, 0);
    });

    it('calculates clean removal for multiline console.log', () => {
        const input = `function test() {\n    console.log(\n        "line 1",\n        "line 2"\n    );\n    return true;\n}`;
        const detections = adapter.detect(input, uri, 'typescript');
        assert.strictEqual(detections.length, 1);
        const edit = adapter.calculateRemovalEdit(input, detections[0]);
        assert.ok(edit.range);
    });
});
