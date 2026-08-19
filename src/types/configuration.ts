import { ConsoleMethod } from '../console/consoleMethods';

export interface ExtensionConfiguration {
  includeTests: boolean;
  includeNodeModules: boolean;
  excludePatterns: string[];
  showNotifications: boolean;
  confirmBeforeRemoval: boolean;
  enabledMethods: ConsoleMethod[];
  previewBeforeRemove: boolean;
}
