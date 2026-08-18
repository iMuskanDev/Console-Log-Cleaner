export const SUPPORTED_LANGUAGE_IDS = new Set([
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact'
]);

export const SUPPORTED_FILE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs'
]);

export function isSupportedLanguage(languageId: string): boolean {
  return SUPPORTED_LANGUAGE_IDS.has(languageId);
}

export function isSupportedFileName(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  for (const ext of SUPPORTED_FILE_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      return true;
    }
  }
  return false;
}
