import { Injectable, LoggerService } from '@nestjs/common';
import * as moment from 'moment';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { DATETIME_FORMAT } from '../constants/date-format.constant';
import { RequestContextService } from '../services/request-context.service';

interface LogMessage {
  message?: string | LogMessage;
  clientIp?: string;
  username?: string;
  context?: string;
  [key: string]: unknown;
}

@Injectable()
export class Logger implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly requestContextService: RequestContextService;

  public logLevels = {
    levels: {
      fatal: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      sql: 5,
      data: 6,
    },
    colors: {
      fatal: 'magenta',
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      sql: 'cyan',
      data: 'pink',
    },
  };

  constructor() {
    this.requestContextService = new RequestContextService();

    const messageFormat = winston.format.printf(
      ({ level, message, context }: winston.Logform.TransformableInfo) => {
        const timeStr = moment().format(DATETIME_FORMAT);
        let parsedMessage: LogMessage;
        let messageRender: string;

        // Xử lý cả format cũ (object) và format mới (string)
        if (typeof message === 'string') {
          // Format mới: trực tiếp là string
          messageRender = message;
        } else {
          // Format cũ: object với message property
          try {
            parsedMessage =
              typeof message === 'string'
                ? (JSON.parse(message) as LogMessage)
                : (message as LogMessage);
          } catch {
            parsedMessage = { message: String(message) };
          }

          const messageValue = parsedMessage.message;
          if (
            typeof messageValue === 'object' &&
            messageValue !== null &&
            'message' in messageValue &&
            typeof messageValue.message === 'string'
          ) {
            messageRender = messageValue.message;
          } else {
            messageRender = String(messageValue || message);
          }
        }

        // Format theo kiểu như trong hình: [CONTEXT] timestamp - message
        const contextStr =
          context && typeof context === 'string' ? `[${context}]` : '';
        // Sử dụng level gốc thay vì chuyển thành uppercase để giữ nguyên INFO
        const levelDisplay = level;

        // Đảm bảo message chỉ nằm trên 1 hàng bằng cách thay thế \n bằng space
        const cleanMessage = String(messageRender)
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ');

        return `${levelDisplay.toUpperCase()} ${contextStr} ${timeStr} - ${cleanMessage}`;
      },
    );

    // Custom format cho console với màu sắc đẹp
    const consoleMessageFormat = winston.format.printf(
      ({ level, message, context }: winston.Logform.TransformableInfo) => {
        const timeStr = moment().format('MM/DD/YYYY, h:mm:ss A');
        let parsedMessage: LogMessage;
        let messageRender: string;

        // Xử lý message
        if (typeof message === 'string') {
          messageRender = message;
        } else {
          try {
            parsedMessage =
              typeof message === 'string'
                ? (JSON.parse(message) as LogMessage)
                : (message as LogMessage);
          } catch {
            parsedMessage = { message: String(message) };
          }

          const messageValue = parsedMessage.message;
          if (
            typeof messageValue === 'object' &&
            messageValue !== null &&
            'message' in messageValue &&
            typeof messageValue.message === 'string'
          ) {
            messageRender = messageValue.message;
          } else {
            messageRender = String(messageValue || message);
          }
        }

        // Lấy requestId từ message nếu có format [requestId]
        let requestId = this.requestContextService.getRequestId();
        if (
          typeof messageRender === 'string' &&
          messageRender.match(/^\[[A-Za-z0-9]{5}\]/)
        ) {
          const match = messageRender.match(/^\[([A-Za-z0-9]{5})\]/);
          if (match) {
            requestId = match[1];
            // Loại bỏ requestId khỏi message để tránh duplicate
            messageRender = messageRender.replace(/^\[[A-Za-z0-9]{5}\]\s*/, '');
          }
        }

        // Sử dụng requestId thay vì process.pid, nhưng giữ [Nest]
        const idDisplay = requestId || process.pid.toString();

        // Xác định màu sắc và format dựa trên context
        if (
          context &&
          typeof context === 'string' &&
          context.includes('HttpLoggingInterceptor')
        ) {
          const isError = level === 'error';

          // Màu sắc
          const nestColor = isError ? '\x1b[31m' : '\x1b[32m'; // đỏ cho error, xanh lá cho khác
          const timestampColor = '\x1b[37m'; // trắng
          const levelColor = isError ? '\x1b[31m' : '\x1b[36m'; // đỏ hoặc xanh da trời
          const contextColor = '\x1b[33m'; // cam
          const messageColor = isError ? '\x1b[31m' : '\x1b[36m'; // đỏ hoặc xanh da trời
          const resetColor = '\x1b[0m';

          // Format level với padding cố định để thẳng hàng
          let levelPadding = '';
          if (level === 'error') {
            levelPadding = ' '; // 4 spaces để thẳng hàng với INFO
          } else if (level === 'info') {
            levelPadding = '  '; // 4 spaces
          } else if (level === 'debug') {
            levelPadding = '   '; // 3 spaces
          } else if (level === 'log') {
            levelPadding = '     '; // 5 spaces
          } else {
            levelPadding = '    '; // 4 spaces
          }

          return `${nestColor}[Nest] ${idDisplay}  - ${timestampColor}${timeStr}${resetColor}  ${levelPadding}${levelColor}${level.toUpperCase()}${resetColor} ${contextColor}[${context}]${resetColor} ${messageColor}${messageRender}${resetColor}`;
        }

        // Format mặc định cho các log khác
        const isError = level === 'error';

        // Màu sắc
        const nestColor = isError ? '\x1b[31m' : '\x1b[32m'; // đỏ cho error, xanh lá cho khác
        const timestampColor = '\x1b[37m'; // trắng
        const levelColor = isError ? '\x1b[31m' : '\x1b[36m'; // đỏ hoặc xanh da trời
        const contextColor = '\x1b[33m'; // cam
        const messageColor = isError ? '\x1b[31m' : '\x1b[36m'; // đỏ hoặc xanh da trời
        const resetColor = '\x1b[0m';

        // Format level với padding cố định để thẳng hàng
        let levelPadding = '';
        if (level === 'error') {
          levelPadding = '    '; // 4 spaces để thẳng hàng với INFO
        } else if (level === 'info') {
          levelPadding = '    '; // 4 spaces
        } else if (level === 'debug') {
          levelPadding = '   '; // 3 spaces
        } else if (level === 'log') {
          levelPadding = '     '; // 5 spaces
        } else {
          levelPadding = '    '; // 4 spaces
        }
        const contextStr =
          context && typeof context === 'string' ? `[${context}]` : '';

        return `${nestColor}[Nest] ${idDisplay}  - ${timestampColor}${timeStr}${resetColor}  ${levelPadding}${levelColor}${level.toUpperCase()}${resetColor} ${contextColor}${contextStr}${resetColor} ${messageColor}${messageRender}${resetColor}`;
      },
    );

    const timezoned = () => moment().format(DATETIME_FORMAT);

    const { combine, timestamp, splat, align } = winston.format;

    const fatalTransporter = new winston.transports.DailyRotateFile({
      level: 'fatal',
      format: combine(
        timestamp({ format: timezoned }),
        align(),
        splat(),
        messageFormat,
      ),
      filename: 'logs/fatal-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
    });
    const errorTransporter = new winston.transports.DailyRotateFile({
      level: 'error',
      format: combine(
        timestamp({ format: timezoned }),
        align(),
        splat(),
        messageFormat,
      ),
      maxSize: '20m',
      maxFiles: '14d',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
    });
    const infoTransporter = new winston.transports.DailyRotateFile({
      level: 'info',
      format: combine(
        timestamp({ format: timezoned }),
        align(),
        splat(),
        messageFormat,
      ),
      maxSize: '20m',
      maxFiles: '14d',
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
    });

    const consoleTransporter = new winston.transports.Console({
      level: 'debug',
      format: combine(splat(), consoleMessageFormat),
    });

    this.logger = winston.createLogger({
      levels: this.logLevels.levels,
      transports: [fatalTransporter, errorTransporter, infoTransporter],
    });
    this.logger.add(consoleTransporter);
  }

  // Method để set requestId cho current context
  setRequestId(requestId: string): void {
    this.requestContextService.setRequestId(requestId);
  }

  // Method để clear requestId
  clearRequestId(): void {
    this.requestContextService.clearRequestId();
  }

  log(level: 'log' | 'info' | 'warn', message: unknown): void {
    switch (level) {
      case 'log':
        this.info(message);
        break;
      case 'info':
        this.info(message);
        break;
      case 'warn':
        this.warn(message);
        break;
    }
  }

  error(message: unknown, context?: string): void {
    this.logger.log({
      level: 'error',
      message: String(message),
      context,
    });
  }

  warn(message: unknown, context?: string): void {
    this.logger.log({
      level: 'warn',
      message: String(message),
      context,
    });
  }

  debug(message: unknown, context?: string): void {
    this.logger.log({
      level: 'debug',
      message: String(message),
      context,
    });
  }

  verbose(message: unknown, context?: string): void {
    this.logger.log({
      level: 'verbose',
      message: String(message),
      context,
    });
  }

  info(message: unknown, context?: string): void {
    this.logger.log({
      level: 'info',
      message: String(message),
      context,
    });
  }

  logMigration(message: string): void {
    this.info(`[Migration] - ${message}`);
  }

  logQuery(query: string, parameters?: unknown[]): void {
    this.logger.log({
      level: 'sql',
      message: JSON.stringify({
        message: `[SQL] - ${query}`,
      }),
      context: 'SQL',
    });

    if (parameters && parameters.length) {
      this.logger.log({
        level: 'sql',
        message: JSON.stringify({
          message: `[Parameters] - ${JSON.stringify(parameters)}`,
        }),
        context: 'SQL',
      });
    }
  }

  logQueryError(error: string, query: string, parameters?: unknown[]): void {
    this.error(`[SQL Error] - ${query}`, 'SQL');
    if (parameters && parameters.length) {
      this.info(`[SQL Parameters] - ${JSON.stringify(parameters)}`, 'SQL');
    }
    this.error(`[SQL Error Details] - ${error}`, 'SQL');
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    this.warn(`[Slow Query] - ${query}`, 'SQL');
    if (parameters && parameters.length) {
      this.info(`[SQL Parameters] - ${JSON.stringify(parameters)}`, 'SQL');
    }
    this.warn(`[Execution Time] - ${time}ms`, 'SQL');
  }

  logSchemaBuild(message: string): void {
    this.info(`[Schema Build] - ${message}`, 'Schema');
  }
}
