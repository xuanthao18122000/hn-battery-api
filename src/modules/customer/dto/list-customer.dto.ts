import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { StatusCommonEnum } from 'src/enums';

export class ListCustomerDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Tìm theo tên/số điện thoại/email',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Trạng thái',
    enum: StatusCommonEnum,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  @IsOptional()
  status?: StatusCommonEnum;
}
