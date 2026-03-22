import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import {
  IsStringField,
  IsNotEmptyField,
  IsMinLengthField,
  IsMaxLengthField,
  IsPhoneNumberField,
} from 'src/decorators/validation.decorators';

export class SignUpDto {
  @ApiProperty({
    description: 'Họ và tên',
    example: 'Thao Nguyen',
  })
  @IsStringField('Họ và tên phải là chuỗi ký tự')
  @IsNotEmptyField('Họ và tên không được để trống')
  @IsMinLengthField(2, 'Họ và tên phải có ít nhất 2 ký tự')
  @IsMaxLengthField(100, 'Họ và tên không được vượt quá 100 ký tự')
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại',
    example: '01312441412412',
  })
  @IsStringField('Số điện thoại phải là chuỗi ký tự')
  @IsNotEmptyField('Số điện thoại không được để trống')
  @IsPhoneNumberField()
  @IsMinLengthField(10, 'Số điện thoại phải có ít nhất 10 ký tự')
  @IsMaxLengthField(128, 'Số điện thoại không được vượt quá 128 ký tự')
  phoneNumber: string;

  @ApiProperty({
    description: 'Email',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmptyField('Email không được để trống')
  email: string;

  @ApiProperty({
    description: 'Mật khẩu',
    example: 'StrongPassword123!',
  })
  @IsStringField('Mật khẩu phải là chuỗi ký tự')
  @IsNotEmptyField('Mật khẩu không được để trống')
  @IsMinLengthField(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  @IsMaxLengthField(32, 'Mật khẩu không được vượt quá 32 ký tự')
  password: string;
}
