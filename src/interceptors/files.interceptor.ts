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

interface RequestWithFiles extends Omit<Express.Request, 'files'> {
  files?: MulterFile[];
  [key: string]: unknown;
}

@Injectable()
export class FilesValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithFiles>();
    const files = request.files;

    if (!Array.isArray(files)) {
      return next.handle();
    }
    for (const file of files) {
      this.validateFileSize(file);
    }

    return next.handle();
  }

  private validateFileSize(file: MulterFile) {
    const maxFileSize = 20 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new BadRequestException('Dung lượng file quá lớn, tối đa 20MB');
    }
  }
}
