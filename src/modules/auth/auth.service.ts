import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  SignInDto,
  SignUpDto,
  ResetPasswordDto,
  UpdateMeDto,
  ChangePasswordDto,
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthData } from './interfaces/auth-response.interface';
import { UserResponseDto } from '../user/dto';
import { ErrorCode } from 'src/constants';
import { getDefaultAvatar, validateHash } from 'src/utils';
import { UserStatusEnum } from 'src/enums';
import { getEnv } from 'src/configs';
import { getCurrentDateWithTime } from 'src/helpers';
import { User } from 'src/database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async signUp({ email, password, fullName, phoneNumber }: SignUpDto) {
    const existingEmail = await this.userRepo.findOne({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException(ErrorCode.USER_EXISTED);
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = this.userRepo.create({
      fullName: fullName,
      email,
      phoneNumber,
      avatar: getDefaultAvatar(fullName),
      password: hashedPassword,
    });

    await this.userRepo.save(newUser);
    return true;
  }

  async signIn({ email, password }: SignInDto): Promise<AuthData> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(ErrorCode.INVALID_CREDENTIALS);
    }

    if (!validateHash(password, user.password)) {
      throw new BadRequestException(ErrorCode.INVALID_CREDENTIALS);
    }

    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException(ErrorCode.ACCOUNT_LOCKED);
    }

    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      user: new UserResponseDto(user),
    };
  }

  signOut() {
    return true;
  }

  private generateAccessToken(user: User) {
    const accessTokenPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
      loginAt: getCurrentDateWithTime(),
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: getEnv<string>('JWT_SECRET'),
      expiresIn: getEnv<number>('JWT_EXPIRES_IN'),
    });

    return accessToken;
  }

  async resetPassword({
    userId,
    password = '123456aA@',
  }: ResetPasswordDto): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    const hashedPassword = await this.hashPassword(password);

    await this.userRepo.update(userId, {
      password: hashedPassword,
    });

    return true;
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user || user.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND_OR_INACTIVE);
    }

    return new UserResponseDto(user);
  }

  async getCurrentUser(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    if (user.status !== UserStatusEnum.ACTIVE) {
      throw new BadRequestException(ErrorCode.ACCOUNT_LOCKED);
    }

    return new UserResponseDto(user);
  }

  async updateMe(
    userId: number,
    updateMeDto: UpdateMeDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }

    await this.userRepo.update(userId, {
      fullName: updateMeDto.fullName,
      address: updateMeDto.address,
      phoneNumber: updateMeDto.phoneNumber,
    });

    return this.getCurrentUser(userId);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }

    if (!validateHash(changePasswordDto.oldPassword, user.password)) {
      throw new BadRequestException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.userRepo.update(userId, {
      password: hashedPassword,
      lastRequireLogoutAt: getCurrentDateWithTime(),
    });

    return new UserResponseDto(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
