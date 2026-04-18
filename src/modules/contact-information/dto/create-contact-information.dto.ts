import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContactStatusEnum } from 'src/database/entities/contact-information.entity';

export class CreateContactInformationDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên người liên hệ',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'nguyenvana@email.com',
    description: 'Email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({
    example: '123 Đường ABC, Quận XYZ, TP. HCM',
    description: 'Địa chỉ',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 123,
    description: 'ID sản phẩm liên quan (nếu có)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;

  @ApiProperty({
    example: ContactStatusEnum.NEW,
    description: 'Trạng thái',
    enum: ContactStatusEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(ContactStatusEnum)
  status?: ContactStatusEnum;

  @ApiProperty({
    example: 'Ghi chú về khách hàng',
    description: 'Ghi chú',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
