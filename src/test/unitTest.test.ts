import * as assert from 'assert';
import { removeConsoleFromText } from '../extension';

describe('Remove Console Unit Tests', () => {
    it('1. removes simple single-line console.log', () => {
        const input = `const a = 5;\nconsole.log(a);\nconst b = 10;`;
        const expected = `const a = 5;\nconst b = 10;`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('2. removes commented console.log', () => {
        const input = `const a = 5;\n// console.log("debug", a);\nconst b = 10;`;
        const expected = `const a = 5;\nconst b = 10;`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('3. removes multiline console statements', () => {
        const input = `function test() {\n    console.log(\n        "line 1",\n        "line 2"\n    );\n    return true;\n}`;
        const expected = `function test() {\n    return true;\n}`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('4. removes console statements in catch blocks without touching catch block structure', () => {
        const input = `try {\n    doSomething();\n} catch (err) {\n    console.error("Error processing async Slack message:", err);\n}`;
        const expected = `try {\n    doSomething();\n} catch (err) {\n}`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('5. removes multiline console in catch blocks cleanly', () => {
        const input = `try {\n    doSomething();\n} catch (err) {\n    console.error(\n        "Error processing async Slack message:",\n        err\n    );\n}`;
        const expected = `try {\n    doSomething();\n} catch (err) {\n}`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });
});
