import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { generateUniqueCode } from '../utils/crypto.util';

export interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    req.requestId = generateUniqueCode({
      prefix: '',
      length: 5,
      uppercase: false,
    });

    res.setHeader('X-Request-ID', req.requestId);

    next();
  }
}
