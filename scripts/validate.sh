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
node scripts/build-vsix.js

if [ -f "release/0.1.0/console-log-cleaner-0.1.0.vsix" ]; then
  echo "Extension VSIX packaging validation passed."
else
  echo "Error: Failed to create VSIX package."
  exit 1
fi

echo "=========================================="
echo " SUCCESS: All validation checks passed!"
echo "=========================================="
