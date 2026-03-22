import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities';
import { getEnv } from 'src/configs';
import { StatusCommonEnum } from 'src/enums';
import { ErrorCode } from 'src/constants';
import { IS_PUBLIC_KEY } from 'src/decorators';

interface JwtPayload {
  email: string;
  sub?: string;
  iat?: number;
  exp?: number;
  loginAt?: Date;
  [key: string]: unknown;
}

export interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private jwtService: JwtService,

    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: getEnv<string>('JWT_SECRET'),
      });

      const user = await this.userRepo
        .createQueryBuilder('user')
        .where('user.email = :email', { email: payload.email })
        .andWhere('user.status = :status', { status: StatusCommonEnum.ACTIVE })
        .getOne();

      if (!user) {
        throw new UnauthorizedException(ErrorCode.USER_NOT_FOUND);
      }

      // if (
      //   user.lastRequireLogoutAt &&
      //   moment(payload.loginAt).isBefore(user.lastRequireLogoutAt)
      // ) {
      //   throw new UnauthorizedException(ErrorCode.TOKEN_EXPIRED);
      // }

      request.user = user;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
