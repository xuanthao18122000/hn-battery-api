import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithId } from '../middleware/request-id.middleware';

export const RequestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithId>();
    return request.requestId;
  },
);
