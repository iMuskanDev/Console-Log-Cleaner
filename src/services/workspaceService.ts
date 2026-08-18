import * as vscode from 'vscode';
import { ConfigurationService } from './configurationService';
import { LanguageRegistry } from '../languages/core/LanguageRegistry';
import { DetectorEngine } from '../detectors/detectorEngine';
import { DetectionResult, WorkspaceScanResult } from '../types/detection';
import { FileService } from './fileService';
import { Logger } from '../utils/logger';

export class WorkspaceService {
  private registry: LanguageRegistry;
  private detectorEngine: DetectorEngine;
  private fileService: FileService;

  constructor() {
    this.registry = LanguageRegistry.getInstance();
    this.detectorEngine = new DetectorEngine(this.registry);
    this.fileService = new FileService();
  }

  /**
   * Scans all supported files in the workspace matching configured rules.
   */
  public async scanWorkspace(
    progress?: vscode.Progress<{ message?: string; increment?: number }>
  ): Promise<WorkspaceScanResult> {
    const config = ConfigurationService.getConfiguration();
    const files = await this.findWorkspaceFiles(config.excludePatterns, config.includeNodeModules);

    const fileDetections = new Map<string, DetectionResult[]>();
    let totalStatements = 0;

    const total = files.length;
    for (let i = 0; i < total; i++) {
      const uri = files[i];

      if (progress) {
        progress.report({
          message: `${i + 1}/${total} files: ${uri.fsPath.split('/').pop()}`,
          increment: (1 / total) * 100
        });
      }

      const docData = await this.fileService.readDocumentText(uri);
      if (!docData) {
        continue;
      }

      const adapter = this.registry.getAdapterForFile(uri.fsPath);
      if (!adapter) {
        continue;
      }

      const detections = this.detectorEngine.detectInText(docData.text, uri, adapter.supportedLanguageIds[0]);
      if (detections.length > 0) {
        fileDetections.set(uri.fsPath, detections);
        totalStatements += detections.length;
      }
    }

    return {
      totalStatements,
      totalFiles: fileDetections.size,
      fileDetections
    };
  }

  /**
   * Applies removal edits to all detected console.log() statements across workspace files.
   */
  public async removeDetectionsFromWorkspace(
    scanResult: WorkspaceScanResult,
    progress?: vscode.Progress<{ message?: string; increment?: number }>
  ): Promise<{ removedStatements: number; modifiedFiles: number }> {
    let removedStatements = 0;
    let modifiedFiles = 0;

    const entries = Array.from(scanResult.fileDetections.entries());
    const total = entries.length;

    for (let i = 0; i < total; i++) {
      const [filePath, detections] = entries[i];
      const uri = vscode.Uri.file(filePath);

      if (progress) {
        progress.report({
          message: `${i + 1}/${total} updating: ${filePath.split('/').pop()}`,
          increment: (1 / total) * 100
        });
      }

      try {
        const document = await vscode.workspace.openTextDocument(uri);
        const count = await this.fileService.removeDetectionsFromFile(document, detections);
        if (count > 0) {
          removedStatements += count;
          modifiedFiles++;
        }
      } catch (err) {
        Logger.error(`Error applying workspace removal to ${filePath}`, err);
      }
    }

    return { removedStatements, modifiedFiles };
  }

  /**
   * Finds matching source files in open workspace folders.
   */
  private async findWorkspaceFiles(
    customExcludes: string[],
    includeNodeModules: boolean
  ): Promise<vscode.Uri[]> {
    const includePattern = '**/*.{js,jsx,ts,tsx,mjs,cjs}';

    let excludePatternString = '{' + customExcludes.join(',') + '}';
    if (!includeNodeModules && !excludePatternString.includes('node_modules')) {
      excludePatternString = '{**/node_modules/**,' + customExcludes.join(',') + '}';
    }

    try {
      return await vscode.workspace.findFiles(includePattern, excludePatternString);
    } catch (err) {
      Logger.error('Failed to query workspace files', err);
      return [];
    }
  }
}
