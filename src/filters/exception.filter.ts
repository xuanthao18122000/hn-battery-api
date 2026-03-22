import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ValidationError,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../constants/error-code';

interface ErrorResponse {
  code: string;
  message: string;
  errors?: Record<string, string[]> | ValidationError[];
}

interface StandardResponse {
  statusCode: string;
  message: string;
  errors?: Record<string, string[]> | ValidationError[];
  success: boolean;
}

interface ValidationErrorResponse {
  message: string[] | string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Map HTTP status codes to error codes
  private readonly statusToErrorCodeMap: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST.code,
    [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED.code,
    [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN.code,
    [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND.code,
    [HttpStatus.CONFLICT]: ErrorCode.CONFLICT.code,
  };

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Kiểm tra nếu là CustomException (có code và message)
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'code' in exceptionResponse &&
        'message' in exceptionResponse &&
        typeof exceptionResponse.code === 'string' &&
        typeof exceptionResponse.message === 'string'
      ) {
        errorResponse = {
          code: exceptionResponse.code,
          message: exceptionResponse.message,
        };
      } else {
        // Xử lý cho các HttpException mặc định
        const errorMessage = this.getErrorMessage(exceptionResponse);
        const validationErrors = this.getValidationErrors(exceptionResponse);

        errorResponse = {
          code: this.getErrorCodeFromStatus(statusCode),
          message: errorMessage,
        };

        if (validationErrors) {
          errorResponse.errors = validationErrors;
        }
      }
    } else {
      // Xử lý các lỗi không phải HttpException
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        code: ErrorCode.OTHER.code,
        message:
          exception instanceof Error ? exception.message : 'Lỗi không xác định',
      };
    }

    const standardResponse: StandardResponse = {
      success: false,
      statusCode: errorResponse.code,
      message: errorResponse.message,
    };

    if (errorResponse.errors) {
      standardResponse.errors = errorResponse.errors;
    }

    response.status(statusCode).json(standardResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    return this.statusToErrorCodeMap[status] || ErrorCode.OTHER.code;
  }

  private getErrorMessage(exceptionResponse: unknown): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      // Check for validation messages
      if ('message' in exceptionResponse) {
        const validationResponse = exceptionResponse as ValidationErrorResponse;
        if (Array.isArray(validationResponse.message)) {
          return validationResponse.message[0] || 'Lỗi dữ liệu không hợp lệ';
        }
        return String(validationResponse.message);
      }
    }

    return 'Lỗi không xác định';
  }

  private getValidationErrors(
    exceptionResponse: unknown,
  ): Record<string, string[]> | null {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const validationResponse = exceptionResponse as ValidationErrorResponse;
      if (Array.isArray(validationResponse.message)) {
        const errors: Record<string, string[]> = {};

        validationResponse.message.forEach((message: string) => {
          const matches = /([^.]+) (.+)/.exec(message);
          if (matches && matches.length >= 3) {
            const property = matches[1].trim();
            const errorMsg = matches[2].trim();

            if (!errors[property]) {
              errors[property] = [];
            }
            errors[property].push(errorMsg);
          }
        });

        return Object.keys(errors).length > 0 ? errors : null;
      }
    }

    return null;
  }
}
