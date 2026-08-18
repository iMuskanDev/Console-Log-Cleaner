# Console Log Cleaner Roadmap

## Release Roadmap

### v0.1.x (Current Initial Target)
- [x] Core AST detection engine for JavaScript, TypeScript, JSX, and TSX files using TypeScript Compiler API.
- [x] Decoupled `LanguageAdapter` plugin architecture.
- [x] Conservative `console.log(...)` detection scope.
- [x] Workspace & single-file scanning and removal commands.
- [x] Quick Fix Code Action (`Remove console.log()`).
- [x] Native `WorkspaceEdit` with undo integration (`Cmd+Z`).

### v0.2.x
- [ ] Scanning preview diff provider before workspace removal.
- [ ] Ignore directive comments (e.g. `// console-log-cleaner-ignore`).
- [ ] Performance enhancements for large mono-repositories with worker threads.

### v0.3.x
- [ ] Additional JavaScript console statement variants (`console.error`, `console.warn`, `console.info`, `console.debug`, `console.trace`).

### Future Expansion (Planned Language Adapters)
- [ ] **Python Adapter**: `PythonAdapter` for `print(...)` detection.
- [ ] **Java Adapter**: `JavaAdapter` for `System.out.println(...)` detection.
- [ ] **C++ Adapter**: `CppAdapter` for `std::cout` detection.
- [ ] **C Adapter**: `CAdapter` for `printf(...)` detection.
- [ ] **C# Adapter**: `CSharpAdapter` for `Console.WriteLine(...)` detection.
- [ ] **Go Adapter**: `GoAdapter` for `fmt.Println(...)` detection.
- [ ] **Rust Adapter**: `RustAdapter` for `println!(...)` detection.
- [ ] **Ruby Adapter**: `RubyAdapter` for `puts` detection.
