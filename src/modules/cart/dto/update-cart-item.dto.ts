import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
  Min,
} from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'Số lượng mới',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: { color: 'Trắng', size: 'L' },
    description: 'Thuộc tính đã chọn',
    required: false,
  })
  @IsOptional()
  @IsObject()
  selectedAttributes?: object;

  @ApiProperty({
    example: 'Ghi chú mới',
    description: 'Ghi chú',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

