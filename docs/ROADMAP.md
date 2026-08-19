# Console Log Cleaner Roadmap

## Release Roadmap

### v0.1.x (Initial Target)
- [x] Core AST detection engine for JavaScript, TypeScript, JSX, and TSX files using TypeScript Compiler API.
- [x] Decoupled `LanguageAdapter` plugin architecture.
- [x] Workspace & single-file scanning and removal commands.
- [x] Quick Fix Code Action (`Remove console.log()`).
- [x] Native `WorkspaceEdit` with undo integration (`Cmd+Z`).

### v0.2.x (Phase 2 Expansion)
- [x] Expand detection to all 18 standard JavaScript/TypeScript console methods (`log`, `info`, `warn`, `error`, `debug`, `trace`, `dir`, `table`, `time`, `timeEnd`, `timeLog`, `count`, `countReset`, `assert`, `clear`, `group`, `groupCollapsed`, `groupEnd`).
- [x] 18 individual console method removal commands.
- [x] Bulk cleanup using `consoleLogCleaner.enabledMethods`.
- [x] Selection-based console statement removal (`consoleLogCleaner.removeFromSelection`).
- [x] Optional side-by-side diff preview window before removal (`consoleLogCleaner.previewBeforeRemove`).
- [x] Editor context menu integration (`Console Log Cleaner`).
- [x] Paired methods handling abstraction (`src/console/pairedMethods.ts`).

### Future Expansion (Planned Language Adapters)
- [ ] **Python Adapter**: `PythonAdapter` for `print(...)` detection.
- [ ] **Java Adapter**: `JavaAdapter` for `System.out.println(...)` detection.
- [ ] **C++ Adapter**: `CppAdapter` for `std::cout` detection.
- [ ] **C Adapter**: `CAdapter` for `printf(...)` detection.
- [ ] **C# Adapter**: `CSharpAdapter` for `Console.WriteLine(...)` detection.
- [ ] **Go Adapter**: `GoAdapter` for `fmt.Println(...)` detection.
- [ ] **Rust Adapter**: `RustAdapter` for `println!(...)` detection.
- [ ] **Ruby Adapter**: `RubyAdapter` for `puts` detection.
