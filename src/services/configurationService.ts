import * as vscode from 'vscode';
import { ExtensionConfiguration } from '../types/configuration';

export class ConfigurationService {
  private static readonly CONFIG_SECTION = 'consoleLogCleaner';

  public static getConfiguration(): ExtensionConfiguration {
    const config = vscode.workspace.getConfiguration(ConfigurationService.CONFIG_SECTION);

    return {
      includeTests: config.get<boolean>('includeTests', true),
      includeNodeModules: config.get<boolean>('includeNodeModules', false),
      excludePatterns: config.get<string[]>('excludePatterns', [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/out/**',
        '**/coverage/**'
      ]),
      showNotifications: config.get<boolean>('showNotifications', true),
      confirmBeforeRemoval: config.get<boolean>('confirmBeforeRemoval', true)
    };
  }
}
