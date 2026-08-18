# Supported Languages & Statement Target Matrix

## Current Released Languages (v0.1.0)

| Language | Extensions | Target Statement | Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **JavaScript** | `.js`, `.mjs`, `.cjs` | `console.log(...)` | AST (`TypeScript Compiler API`) | **Supported** |
| **TypeScript** | `.ts` | `console.log(...)` | AST (`TypeScript Compiler API`) | **Supported** |
| **React JSX** | `.jsx` | `console.log(...)` | AST (`TypeScript Compiler API`) | **Supported** |
| **React TSX** | `.tsx` | `console.log(...)` | AST (`TypeScript Compiler API`) | **Supported** |

---

## Detection Constraints (v0.1.0)

The initial version of Console Log Cleaner is intentionally conservative to prevent false positive code removal.

### Active Detection Target:
- `console.log(...)`

### Explicitly Excluded Targets in v0.1.0:
- `console.error(...)` (Planned)
- `console.warn(...)` (Planned)
- `console.info(...)` (Planned)
- `console.debug(...)` (Planned)
- `console.trace(...)` (Planned)
- `window.console.log(...)`
- `globalThis.console.log(...)`
- `console["log"](...)`
- `const c = console; c.log(...)`
- `obj.console.log(...)`

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
