# Supported Languages & Statement Target Matrix

## Current Released Languages (v0.2.0)

| Language | Extensions | Target Statements | Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **JavaScript** | `.js`, `.mjs`, `.cjs` | All 18 `console.*` methods | AST (`TypeScript Compiler API`) | **Supported** |
| **TypeScript** | `.ts` | All 18 `console.*` methods | AST (`TypeScript Compiler API`) | **Supported** |
| **React JSX** | `.jsx` | All 18 `console.*` methods | AST (`TypeScript Compiler API`) | **Supported** |
| **React TSX** | `.tsx` | All 18 `console.*` methods | AST (`TypeScript Compiler API`) | **Supported** |

---

## Supported Console Methods (18 Methods)

| Category | Supported Statements |
| :--- | :--- |
| **Standard Logging** | `console.log()`, `console.info()`, `console.warn()`, `console.error()`, `console.debug()`, `console.trace()` |
| **Data & Inspection** | `console.dir()`, `console.table()`, `console.assert()`, `console.clear()` |
| **Timers & Counters** | `console.time()`, `console.timeEnd()`, `console.timeLog()`, `console.count()`, `console.countReset()` |
| **Grouping** | `console.group()`, `console.groupCollapsed()`, `console.groupEnd()` |

---

## Excluded Targets (Protection Safety)

The AST parser distinguishes executable code from strings and comments:
- Commented code (e.g. `// console.warn("test")` or `/* console.error("test") */`) is **never** removed.
- String literals (e.g. `const text = "console.log"`) are **never** removed.
- Global/Object prefix expressions (e.g. `window.console.log()`, `globalThis.console.log()`, `obj.console.log()`, `console["log"]()`) are **never** removed.

---

## Planned Future Languages (Roadmap)

The underlying extension architecture (`LanguageAdapter`) is designed to support the following planned languages in future releases:

| Language | File Extensions | Future Target Statement | Adapter Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | `.py` | `print(...)` | `PythonAdapter` | Planned |
| **Java** | `.java` | `System.out.println(...)` | `JavaAdapter` | Planned |
| **C++** | `.cpp`, `.hpp`, `.cc` | `std::cout` | `CppAdapter` | Planned |
| **C** | `.c`, `.h` | `printf(...)` | `CAdapter` | Planned |
| **C#** | `.cs` | `Console.WriteLine(...)` | `CSharpAdapter` | Planned |
| **PHP** | `.php` | `echo` | `PhpAdapter` | Planned |
| **Go** | `.go` | `fmt.Println(...)` | `GoAdapter` | Planned |
| **Rust** | `.rs` | `println!(...)` | `RustAdapter` | Planned |
| **Ruby** | `.rb` | `puts` | `RubyAdapter` | Planned |
