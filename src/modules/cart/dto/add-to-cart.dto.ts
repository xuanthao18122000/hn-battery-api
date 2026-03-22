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

export class AddToCartDto {
  @ApiProperty({
    example: 1,
    description: 'ID sản phẩm',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Số lượng',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: { color: 'Đen', size: 'XL' },
    description: 'Thuộc tính đã chọn',
    required: false,
  })
  @IsOptional()
  @IsObject()
  selectedAttributes?: object;

  @ApiProperty({
    example: 'Giao hàng cẩn thận',
    description: 'Ghi chú',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

