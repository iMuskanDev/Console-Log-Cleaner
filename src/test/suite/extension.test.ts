import * as assert from 'assert';
import { removeConsoleFromText } from '../../extension';

describe('Remove Console Test Suite', () => {
    it('removes simple single-line console.log', () => {
        const input = `const a = 5;\nconsole.log(a);\nconst b = 10;`;
        const expected = `const a = 5;\nconst b = 10;`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('removes commented console.log', () => {
        const input = `const a = 5;\n// console.log("debug", a);\nconst b = 10;`;
        const expected = `const a = 5;\nconst b = 10;`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('removes multiline console statements', () => {
        const input = `function test() {\n    console.log(\n        "line 1",\n        "line 2"\n    );\n    return true;\n}`;
        const expected = `function test() {\n    return true;\n}`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('removes console.error and console.warn', () => {
        const input = `console.error("err");\nconsole.warn("warn");\nconsole.info("info");`;
        const expected = ``;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });

    it('does not corrupt complex nested code structures (SlackController / FacebookController pattern)', () => {
        const input = `async function check() {\n    try {\n        console.log(\n            "complex obj",\n            { a: 1, b: (x) => x + 1 }\n        );\n    } catch (err) {\n        console.error("error:", err);\n    }\n}`;
        const expected = `async function check() {\n    try {\n    } catch (err) {\n    }\n}`;
        assert.strictEqual(removeConsoleFromText(input), expected);
    });
});
