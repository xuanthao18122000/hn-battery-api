import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { SUCCESS_CODE } from '../constants/error-code';

export interface ResponseFormat<T> {
  statusCode: string;
  data: T;
  message: string;
  success: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const status = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data: T) => {
        const message = 'Thành công';

        const responseData: T =
          Array.isArray(data) && data.length === 0
            ? ([] as unknown as T)
            : data;

        response.status(status);

        return {
          success: true,
          statusCode: SUCCESS_CODE,
          data: responseData,
          message: message,
        };
      }),
    );
  }
}
