// Define log levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Logger interface
interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// Logger options interface
interface LoggerOptions {
  minLevel?: LogLevel;
  customFormatter?: (level: LogLevel, message: string, args: any[]) => string;
}

// Logger implementation
class ConsoleLogger implements Logger {
  private minLevel: LogLevel;
  private customFormatter?: (level: LogLevel, message: string, args: any[]) => string;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel || 'info';
    this.customFormatter = options.customFormatter;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string, args: any[]): string {
    if (this.customFormatter) {
      return this.customFormatter(level, message, args);
    }
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private logWithLevel(level: LogLevel, message: string, ...args: any[]) {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, args);
      console[level](formattedMessage, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    this.logWithLevel('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logWithLevel('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logWithLevel('error', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.logWithLevel('debug', message, ...args);
  }
}

// Create and export a single instance of the logger
const logger = new ConsoleLogger({
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export default logger;

// Export individual logging functions for convenience
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logDebug = logger.debug.bind(logger);

export const log = (component: string, message: string, data?: any) => {
  console.log(`[${component}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};