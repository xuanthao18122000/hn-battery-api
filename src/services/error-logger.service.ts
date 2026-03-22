import { Injectable } from '@nestjs/common';
import { Logger } from '../loggers/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { getCurrentTimeAsString } from '../helpers';

interface ErrorContext {
  type?: 'uncaughtException' | 'unhandledRejection';
  promise?: Promise<unknown>;
  [key: string]: unknown;
}

interface ErrorInfo {
  error: string;
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
}

@Injectable()
export class ErrorLoggerService {
  private readonly logDir = 'logs';
  private readonly crashLogFile = 'crash-server.log';

  constructor(private readonly logger: Logger) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  logCrash(error: Error, context: ErrorContext = {}): void {
    const timestamp = getCurrentTimeAsString();
    const errorInfo: ErrorInfo = {
      error: 'CRASH APP',
      timestamp,
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    };

    this.logger.error({
      message: `\x1b[31m# CRASH: ${error.message}\n# Stack: ${error.stack}\x1b[0m`,
      context,
    });

    const logPath = path.join(this.logDir, this.crashLogFile);
    const logEntry = JSON.stringify(errorInfo, null, 2) + '\n---\n';

    let existingContent = '';
    if (fs.existsSync(logPath)) {
      existingContent = fs.readFileSync(logPath, 'utf8');
    }

    fs.writeFileSync(logPath, logEntry + existingContent);
  }

  logUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    this.logCrash(error, { type: 'unhandledRejection', promise });
  }

  logUncaughtException(error: Error): void {
    this.logCrash(error, { type: 'uncaughtException' });
  }
}
