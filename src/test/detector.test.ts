import * as assert from 'assert';
import * as vscode from 'vscode';
import { TypeScriptDetector } from '../languages/javascript/TypeScriptDetector';

describe('TypeScriptDetector AST Unit Tests', () => {
  const dummyUri = vscode.Uri.file('/mock/test.ts');

  it('1. detects basic single line console.log', () => {
    const code = `const a = 1;\nconsole.log(a);`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].line, 2);
    assert.strictEqual(results[0].type, 'console.log');
  });

  it('2. detects multiple console.log statements', () => {
    const code = `console.log("first");\nconsole.log("second");\nconsole.log("third");`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 3);
  });

  it('3. detects multiline console.log statements', () => {
    const code = `console.log(\n  "line 1",\n  "line 2"\n);`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'javascript');
    assert.strictEqual(results.length, 1);
  });

  it('4. detects console.log without semicolon', () => {
    const code = `console.log("no semicolon")`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'javascript');
    assert.strictEqual(results.length, 1);
  });

  it('5. detects console.log inside standard function', () => {
    const code = `function run() {\n  console.log("inside function");\n}`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 1);
  });

  it('6. detects console.log inside arrow function', () => {
    const code = `const fn = () => console.log("arrow");`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 1);
  });

  it('7. detects console.log inside if block', () => {
    const code = `if (true) {\n  console.log("if block");\n}`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 1);
  });

  it('8. detects console.log inside deeply nested blocks', () => {
    const code = `try { if (x) { while(true) { console.log("nested"); } } } catch(e) {}`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 1);
  });

  it('9. DOES NOT detect commented console.log', () => {
    const code = `// console.log("commented");\n/* console.log("block commented"); */`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 0);
  });

  it('10. DOES NOT detect console.log inside string literals', () => {
    const code = `const s = "console.log('hello')";`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'javascript');
    assert.strictEqual(results.length, 0);
  });

  it('11. DOES NOT detect console.log inside template literals', () => {
    const code = "const t = `\nconsole.log(\"hello\")\n`;";
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'javascript');
    assert.strictEqual(results.length, 0);
  });

  it('12. DOES NOT detect similar variable names or methods', () => {
    const code = `const consoleLog = 42;\nconst obj = { console: { log: "prop" } };\nwindow.console.log("window");\nglobalThis.console.log("global");\nconsole["log"]("bracket");`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'javascript');
    assert.strictEqual(results.length, 0);
  });

  it('14-17. supports JavaScript, TypeScript, JSX, and TSX files', () => {
    const jsCode = `console.log("js");`;
    const tsCode = `const x: number = 1; console.log(x);`;
    const jsxCode = `const App = () => <div>{console.log("jsx")}</div>;`;
    const tsxCode = `const App: React.FC = () => <div>{console.log("tsx")}</div>;`;

    assert.strictEqual(TypeScriptDetector.detectConsoleLogs(jsCode, vscode.Uri.file('test.js'), 'javascript').length, 1);
    assert.strictEqual(TypeScriptDetector.detectConsoleLogs(tsCode, vscode.Uri.file('test.ts'), 'typescript').length, 1);
    assert.strictEqual(TypeScriptDetector.detectConsoleLogs(jsxCode, vscode.Uri.file('test.jsx'), 'javascriptreact').length, 1);
    assert.strictEqual(TypeScriptDetector.detectConsoleLogs(tsxCode, vscode.Uri.file('test.tsx'), 'typescriptreact').length, 1);
  });

  it('18. handles empty file safely', () => {
    const results = TypeScriptDetector.detectConsoleLogs('', dummyUri, 'javascript');
    assert.strictEqual(results.length, 0);
  });

  it('19. handles malformed source safely', () => {
    const code = `function broken( { console.log( "unclosed"`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'javascript');
    assert.ok(Array.isArray(results));
  });

  it('20. returns zero results when no console.log is present', () => {
    const code = `const a = 10; const b = 20; return a + b;`;
    const results = TypeScriptDetector.detectConsoleLogs(code, dummyUri, 'typescript');
    assert.strictEqual(results.length, 0);
  });
});
