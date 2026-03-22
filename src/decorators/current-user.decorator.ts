import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/database/entities';
import { RequestWithUser } from 'src/modules/auth/guards/jwt-auth-user.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Omit<User, 'password'> => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as Omit<User, 'password'>;
  },
);
