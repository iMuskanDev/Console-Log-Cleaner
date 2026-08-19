import * as vscode from 'vscode';
import { ExtensionConfiguration } from '../types/configuration';
import { ConsoleMethod, CONSOLE_METHODS } from '../console/consoleMethods';

export class ConfigurationService {
  private static readonly CONFIG_SECTION = 'consoleLogCleaner';

  public static getConfiguration(): ExtensionConfiguration {
    const config = vscode.workspace.getConfiguration(ConfigurationService.CONFIG_SECTION);

    const rawMethods = config.get<string[]>('enabledMethods', ['log']);
    const enabledMethods: ConsoleMethod[] = rawMethods.filter((m): m is ConsoleMethod =>
      (CONSOLE_METHODS as readonly string[]).includes(m)
    );

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
      confirmBeforeRemoval: config.get<boolean>('confirmBeforeRemoval', true),
      enabledMethods: enabledMethods.length > 0 ? enabledMethods : ['log'],
      previewBeforeRemove: config.get<boolean>('previewBeforeRemove', false)
    };
  }
}
