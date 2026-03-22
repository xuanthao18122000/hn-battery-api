import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { getEnv, booleanParser } from 'src/configs';

import { Logger as WinstonLogger } from '../loggers/logger.service';
import { RequestWithId } from '../middleware/request-id.middleware';

interface RequestWithUser extends RequestWithId {
  user?: {
    username?: string;
    email?: string;
    fullName?: string;
    id?: string;
  };
}

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly isLoggingEnabled: boolean;
  private readonly logger = new Logger(HttpLoggingInterceptor.name);
  private readonly winstonLogger = new WinstonLogger();

  constructor() {
    // Sử dụng HTTP_LOGGING thay vì DB_LOGGING, mặc định là true nếu không set
    this.isLoggingEnabled =
      getEnv<boolean>('HTTP_LOGGING', booleanParser) ?? true;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.isLoggingEnabled) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Set requestId vào logger context
    this.winstonLogger.setRequestId(request.requestId);

    this.handleLogRequest(request);
    const startTime = Date.now();
    return next.handle().pipe(
      catchError((error: unknown) => this.handleError(error, request)),
      tap(() => this.handleLogResponse(request, startTime)),
      finalize(() => {
        this.winstonLogger.clearRequestId();
      }),
    );
  }

  private handleLogRequest(request: RequestWithUser): void {
    const userAgent = request.get('user-agent') || '';
    const method = request.method.toUpperCase();

    // Get username if user is authenticated
    const username = this.getUserIdentifier(request);
    const usernameStr = username ? ` - User: ${username}` : '';

    this.winstonLogger.info(
      ` ${method} ${request.url} - User Agent: ${userAgent}${usernameStr}`,
      'HttpLoggingInterceptor.REQUEST',
    );
  }

  private handleError(error: unknown, request: RequestWithUser) {
    const requestBody: unknown = request.body;
    const bodyString =
      typeof requestBody === 'string'
        ? requestBody
        : JSON.stringify(requestBody);
    const MAX_LENGTH = 1000;
    // Chỉ format JSON khi body quá dài (ví dụ: > 1000 ký tự)
    const formattedBody =
      bodyString?.length > MAX_LENGTH
        ? JSON.stringify(requestBody, null, 2)
        : bodyString;

    const username = this.getUserIdentifier(request);
    const usernameStr = username ? ` - User: ${username}` : '';

    this.winstonLogger.error(
      `${request.method.toUpperCase()} ${request.url}${usernameStr} - Request Body: ${formattedBody}`,
      'HttpLoggingInterceptor.ERROR',
    );

    // Log error object với stack trace
    if (error instanceof Error) {
      this.winstonLogger.error(error.stack, 'HttpLoggingInterceptor.ERROR');
    } else if (error instanceof HttpException) {
      const response = error.getResponse();
      this.winstonLogger.error(
        `Status: ${error.getStatus()} - Message: ${JSON.stringify(response)}`,
        'HttpLoggingInterceptor.ERROR',
      );
      if (error.stack) {
        this.winstonLogger.error(error.stack, 'HttpLoggingInterceptor.ERROR');
      }
    } else {
      this.winstonLogger.error(
        `Unknown Error: ${JSON.stringify(error)}`,
        'HttpLoggingInterceptor.ERROR',
      );
    }

    return throwError(() => error);
  }

  private handleLogResponse(request: RequestWithUser, startTime: number): void {
    const responseTime = Date.now() - startTime;
    const requestMethod = request.method.toUpperCase();
    const requestUrl = request.url;

    const username = this.getUserIdentifier(request);
    const usernameStr = username ? ` - User: ${username}` : '';

    // Custom màu cam cho thời gian response
    const orangeColor = '\x1b[33m'; // ANSI color code cho màu cam
    const resetColor = '\x1b[0m'; // Reset màu về mặc định
    const coloredResponseTime = `${orangeColor}[${responseTime}ms]${resetColor}`;

    this.winstonLogger.info(
      `${requestMethod} ${requestUrl}${usernameStr} - ${coloredResponseTime} - Done`,
      'HttpLoggingInterceptor.RESPONSE',
    );
  }

  private getUserIdentifier(request: RequestWithUser): string | undefined {
    if (request.user) {
      return (
        request.user.fullName ||
        request.user.email ||
        request.user.fullName ||
        request.user.id
      );
    }
    return undefined;
  }
}
