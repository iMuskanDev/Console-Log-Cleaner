#!/usr/bin/env bash

set -e

BUMP_ARG=$1

if [ -z "$BUMP_ARG" ]; then
  echo "Error: Version bump argument missing."
  echo "Usage: ./scripts/release.sh [patch|minor|major|X.Y.Z]"
  exit 1
fi

echo "=========================================="
echo " Console Log Cleaner - Release Automation"
echo "=========================================="

# 1. Tool Validation
echo "[1/9] Validating required CLI tools..."
command -v git >/dev/null 2>&1 || { echo "git is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "node is required"; exit 1; }

# 2. Package.json check
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in working directory."
  exit 1
fi

# 3. Git Status Check
echo "[2/9] Checking git repository status..."
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory has uncommitted changes. Commit or stash them before releasing."
  git status --short
  exit 1
fi

# 4. Run Validation Suite
echo "[3/9] Running full validation suite..."
./scripts/validate.sh

# Calculate New Version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

if [ "$BUMP_ARG" = "patch" ] || [ "$BUMP_ARG" = "minor" ] || [ "$BUMP_ARG" = "major" ]; then
  NEW_VERSION=$(npm version $BUMP_ARG --no-git-tag-version)
  NEW_VERSION=${NEW_VERSION#v}
else
  NEW_VERSION=$BUMP_ARG
  npm version $NEW_VERSION --no-git-tag-version >/dev/null 2>&1 || true
fi

echo "[4/9] Target release version: $NEW_VERSION"

RELEASE_DIR="release/$NEW_VERSION"
mkdir -p "$RELEASE_DIR"

TODAY=$(date +%Y-%m-%d)

# 5. Create RELEASE_NOTES.md
echo "[5/9] Generating $RELEASE_DIR/RELEASE_NOTES.md..."
cat <<EOF > "$RELEASE_DIR/RELEASE_NOTES.md"
# Console Log Cleaner Release Notes - v$NEW_VERSION

- **Release Version**: $NEW_VERSION
- **Release Date**: $TODAY
- **License**: MIT
- **Target VS Code Engine**: ^1.75.0

## Release Summary

Version $NEW_VERSION of Console Log Cleaner includes AST-based \`console.log()\` statement detection for JavaScript, TypeScript, JSX, and TSX files, extensible language architecture, Quick Fix code action support, and safe \`WorkspaceEdit\` file modification.

## Features & Improvements
- AST parsing via TypeScript Compiler API (\`ts.createSourceFile\`).
- Comment & string literal protection.
- Workspace and active file commands.
- Quick Fix Code Actions.
EOF

# 6. Create VERSION.md
echo "[6/9] Generating $RELEASE_DIR/VERSION.md..."
cat <<EOF > "$RELEASE_DIR/VERSION.md"
# Console Log Cleaner

Version: $NEW_VERSION

Release Date: $TODAY

License: MIT

Git Tag: v$NEW_VERSION
EOF

# 7. Update CHANGELOG if needed
echo "[7/9] Updating documentation..."
sed -i '' "s/## \[Unreleased\]/## [$NEW_VERSION] - $TODAY/" docs/CHANGELOG.md 2>/dev/null || true

# 8. Build Bundled VSIX Package in Release Directory
VSIX_PATH="$RELEASE_DIR/console-log-cleaner-$NEW_VERSION.vsix"
echo "[8/9] Building bundled VSIX package at $VSIX_PATH..."
node scripts/build-vsix.js

# 9. Create Git Commit and Annotated Tag
echo "[9/9] Creating git commit and annotated tag v$NEW_VERSION..."
git add package.json docs/CHANGELOG.md "$RELEASE_DIR"
git commit -m "chore: release v$NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Console Log Cleaner release v$NEW_VERSION"

echo "=========================================="
echo " RELEASE SUCCESSFUL: v$NEW_VERSION"
echo " Release Artifacts: $RELEASE_DIR/"
echo " Git Tag Created: v$NEW_VERSION"
echo " Note: Changes have NOT been pushed to remote."
echo "=========================================="
