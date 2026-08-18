import * as vscode from 'vscode';

/**
 * OutputChannel logger abstraction for internal diagnostics.
 * Prevents adding uncontrolled console.log() calls into production extension logic.
 */
export class Logger {
  private static channel: vscode.OutputChannel | null = null;
  private static isDebugMode = false;

  public static initialize(channelName = 'Console Log Cleaner', debug = false): void {
    if (!Logger.channel) {
      Logger.channel = vscode.window.createOutputChannel(channelName);
    }
    Logger.isDebugMode = debug;
  }

  public static info(message: string, ...args: unknown[]): void {
    Logger.log('INFO', message, ...args);
  }

  public static warn(message: string, ...args: unknown[]): void {
    Logger.log('WARN', message, ...args);
  }

  public static error(message: string, error?: unknown): void {
    let formattedError = '';
    if (error instanceof Error) {
      formattedError = ` | ${error.name}: ${error.message}\n${error.stack ?? ''}`;
    } else if (error !== undefined) {
      formattedError = ` | ${String(error)}`;
    }
    Logger.log('ERROR', `${message}${formattedError}`);
  }

  public static debug(message: string, ...args: unknown[]): void {
    if (Logger.isDebugMode) {
      Logger.log('DEBUG', message, ...args);
    }
  }

  private static log(level: string, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ` ${JSON.stringify(args)}` : '';
    const line = `[${timestamp}] [${level}] ${message}${formattedArgs}`;

    if (Logger.channel) {
      Logger.channel.appendLine(line);
    }
  }

  public static show(): void {
    if (Logger.channel) {
      Logger.channel.show(true);
    }
  }

  public static dispose(): void {
    if (Logger.channel) {
      Logger.channel.dispose();
      Logger.channel = null;
    }
  }
}
