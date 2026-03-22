import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignUpDto,
  SignInDto,
  ResetPasswordDto,
  UpdateMeDto,
  ChangePasswordDto,
} from './dto';
import { AuthData } from './interfaces/auth-response.interface';
import { UserResponseDto } from '../user/dto';
import { CurrentUser, Public } from 'src/decorators';
import { User } from 'src/database/entities';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('sign-in')
  @ApiOperation({ summary: 'Đăng nhập' })
  signIn(@Body() signInDto: SignInDto): Promise<AuthData> {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @Post('sign-out')
  @ApiOperation({ summary: 'Đăng xuất' })
  signOut() {
    return this.authService.signOut();
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  getMe(@CurrentUser() user: Omit<User, 'password'>) {
    return this.authService.getCurrentUser(user.id);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  updateMe(
    @CurrentUser() user: User,
    @Body() updateMeDto: UpdateMeDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateMe(user.id, updateMeDto);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponseDto> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}
