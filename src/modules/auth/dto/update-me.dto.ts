import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty({ description: 'Họ và tên' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phoneNumber: string;
}
