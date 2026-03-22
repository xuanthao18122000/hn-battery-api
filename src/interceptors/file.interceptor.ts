import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};

// Extend Request interface to include file property
interface RequestWithFile extends Omit<Express.Request, 'file'> {
  file?: MulterFile;
  [key: string]: unknown;
}

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly isRequired: boolean,
    private readonly nameField = 'avatar',
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithFile>();
    const file = request.file;

    if (this.isRequired && !file) {
      throw new BadRequestException('File is required');
    }

    if (!file) {
      return next.handle();
    }

    request[this.nameField] = file;

    return next.handle();
  }
}
