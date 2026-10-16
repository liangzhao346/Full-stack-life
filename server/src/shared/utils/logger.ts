type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levelPriority: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] <= levelPriority[currentLevel];
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta || {}),
  };
  return JSON.stringify(entry);
}

export const logger = {
  error(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('error')) console.error(formatLog('error', message, meta));
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('warn')) console.warn(formatLog('warn', message, meta));
  },
  info(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('info')) console.log(formatLog('info', message, meta));
  },
  debug(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('debug')) console.log(formatLog('debug', message, meta));
  },
};
