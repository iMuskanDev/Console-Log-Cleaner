import { LanguageAdapter } from './LanguageAdapter';
import { Logger } from '../../utils/logger';

export class LanguageRegistry {
  private static instance: LanguageRegistry | null = null;
  private adapters: LanguageAdapter[] = [];
  private languageIdMap = new Map<string, LanguageAdapter>();
  private extensionMap = new Map<string, LanguageAdapter>();

  private constructor() {}

  public static getInstance(): LanguageRegistry {
    if (!LanguageRegistry.instance) {
      LanguageRegistry.instance = new LanguageRegistry();
    }
    return LanguageRegistry.instance;
  }

  public registerAdapter(adapter: LanguageAdapter): void {
    this.adapters.push(adapter);

    for (const langId of adapter.supportedLanguageIds) {
      this.languageIdMap.set(langId, adapter);
    }

    for (const ext of adapter.supportedExtensions) {
      this.extensionMap.set(ext.toLowerCase(), adapter);
    }

    Logger.info(`Registered language adapter: ${adapter.name} (${adapter.supportedLanguageIds.join(', ')})`);
  }

  public getAdapterForLanguage(languageId: string): LanguageAdapter | undefined {
    return this.languageIdMap.get(languageId);
  }

  public getAdapterForFile(filePath: string): LanguageAdapter | undefined {
    const ext = this.getFileExtension(filePath);
    if (ext && this.extensionMap.has(ext)) {
      return this.extensionMap.get(ext);
    }
    return undefined;
  }

  public isSupportedLanguage(languageId: string): boolean {
    return this.languageIdMap.has(languageId);
  }

  public isSupportedFile(filePath: string): boolean {
    const ext = this.getFileExtension(filePath);
    return ext ? this.extensionMap.has(ext) : false;
  }

  public getAllAdapters(): readonly LanguageAdapter[] {
    return this.adapters;
  }

  public clear(): void {
    this.adapters = [];
    this.languageIdMap.clear();
    this.extensionMap.clear();
  }

  private getFileExtension(filePath: string): string | null {
    const lower = filePath.toLowerCase();
    const lastDot = lower.lastIndexOf('.');
    if (lastDot !== -1) {
      return lower.slice(lastDot);
    }
    return null;
  }
}
