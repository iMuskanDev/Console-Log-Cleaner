import { WorkspaceScanResult } from '../types/detection';

export class StatisticsService {
  public static formatScanSummary(result: WorkspaceScanResult): string {
    if (result.totalStatements === 0) {
      return 'No console.log() statements found.';
    }

    const fileWord = result.totalFiles === 1 ? 'file' : 'files';
    const statementWord = result.totalStatements === 1 ? 'statement' : 'statements';

    return `Found ${result.totalStatements} console.log() ${statementWord} across ${result.totalFiles} ${fileWord}.`;
  }

  public static formatRemovalSummary(removedStatements: number, modifiedFiles: number): string {
    if (removedStatements === 0) {
      return 'No console.log() statements were removed.';
    }

    const fileWord = modifiedFiles === 1 ? 'file' : 'files';
    const statementWord = removedStatements === 1 ? 'statement' : 'statements';

    return `Removed ${removedStatements} console.log() ${statementWord} from ${modifiedFiles} ${fileWord}.`;
  }
}
