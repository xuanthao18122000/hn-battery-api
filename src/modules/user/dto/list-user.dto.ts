import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { UserStatusEnum } from 'src/enums';

export class ListUserDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Tên người dùng',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'Số điện thoại',
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Trạng thái',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(UserStatusEnum)
  @IsOptional()
  status: UserStatusEnum;
}
