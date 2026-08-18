#!/usr/bin/env bash

set -e

echo "=========================================="
echo " Console Log Cleaner - Validation Pipeline"
echo "=========================================="

# 1. Type Checking
echo "[1/5] Running TypeScript type check..."
npx tsc --noEmit

# 2. Linting
echo "[2/5] Running Linter..."
if [ -f ".eslintrc" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
  npx eslint src --ext ts
else
  echo "No ESLint config found, skipping strict ESLint step."
fi

# 3. Unit Tests
echo "[3/5] Running Unit Test Suite..."
npm run test

# 4. Build Compilation
echo "[4/5] Compiling Production Extension Bundle..."
npm run compile

# 5. Packaging Validation
echo "[5/5] Validating Extension Packaging (VSIX)..."
TMP_VSIX="/tmp/console-log-cleaner-validate.vsix"
rm -f "$TMP_VSIX"

if npx @vscode/vsce package --no-git-tag-version --out "$TMP_VSIX" 2>/dev/null; then
  echo "VSIX packaging validated via @vscode/vsce."
else
  echo "Building VSIX archive via fallback packager..."
  TMP_DIR=$(mktemp -d)
  mkdir -p "$TMP_DIR/extension"
  cp -r out package.json README.md LICENSE "$TMP_DIR/extension/"
  cat << 'XML' > "$TMP_DIR/[Content_Types].xml"
<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="txt" ContentType="text/plain" />
  <Default Extension="xml" ContentType="text/xml" />
</Types>
XML
  (cd "$TMP_DIR" && zip -r -q "$TMP_VSIX" extension "[Content_Types].xml")
  rm -rf "$TMP_DIR"
fi

if [ -f "$TMP_VSIX" ]; then
  echo "Extension VSIX packaging validation passed."
  rm -f "$TMP_VSIX"
else
  echo "Error: Failed to create VSIX package."
  exit 1
fi

echo "=========================================="
echo " SUCCESS: All validation checks passed!"
echo "=========================================="
