import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  IsString,
} from 'class-validator';
import { ToBooleanCustom } from '../decorators';
import { OrderByEnum } from '../enums';

export class PaginationOptionsDto {
  @ApiPropertyOptional({ enum: OrderByEnum, default: OrderByEnum.DESC })
  @IsEnum(OrderByEnum)
  @IsOptional()
  order?: OrderByEnum = OrderByEnum.DESC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit: number = 10;

  @ApiProperty({
    type: 'boolean',
    description: 'Lấy toàn bộ dữ liệu không phân trang',
    required: false,
    default: false,
  })
  @IsOptional()
  @ToBooleanCustom()
  @IsBoolean()
  getFull?: boolean;

  @ApiPropertyOptional({
    description: 'Tên trường để sắp xếp',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;
}
