# Release Guidelines

## Versioning Policy

`console-log-cleaner` follows [Semantic Versioning (SemVer 2.0.0)](https://semver.org/):
- **MAJOR** (`X.0.0`): Breaking changes to settings or language adapter architecture.
- **MINOR** (`0.X.0`): New language adapters or feature additions.
- **PATCH** (`0.0.X`): Bug fixes and performance patches.

Git release tags must follow format `vX.Y.Z` (e.g. `v0.1.0`).

## Automated Release Script

Releases are generated using `./scripts/release.sh`:

```bash
./scripts/release.sh patch   # Bump patch version (0.1.0 -> 0.1.1)
./scripts/release.sh minor   # Bump minor version (0.1.0 -> 0.2.0)
./scripts/release.sh major   # Bump major version (0.1.0 -> 1.0.0)
./scripts/release.sh 0.1.0   # Explicit version target
```

The release script performs:
1. Validates required environment tools (`git`, `npm`, `tsc`, `@vscode/vsce`).
2. Checks git status to ensure working directory is clean.
3. Runs `./scripts/validate.sh` (typecheck, lint, test, build, vsix packaging).
4. Updates `package.json` version.
5. Updates `docs/CHANGELOG.md`.
6. Generates release directory: `release/X.Y.Z/`.
7. Creates `release/X.Y.Z/RELEASE_NOTES.md` and `release/X.Y.Z/VERSION.md`.
8. Builds `release/X.Y.Z/console-log-cleaner-X.Y.Z.vsix`.
9. Creates annotated git tag `vX.Y.Z` and release commit (`chore: release vX.Y.Z`).

Note: The release script does **NOT** automatically force push or publish to VS Code Marketplace.
