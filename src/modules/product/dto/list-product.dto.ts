import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { StatusCommonEnum } from 'src/enums';

export class ListProductDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Mã SKU',
    required: false,
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Thương hiệu',
    required: false,
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    description: 'ID thương hiệu (brands.id)',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  brandId?: number;

  @ApiProperty({
    description: 'ID danh mục',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: 'ID dung lượng ắc quy (battery_capacities.id), filter WHERE product.batteryCapacityId',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  batteryCapacityId?: number;

  @ApiProperty({
    description: 'Giá từ',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceFrom?: number;

  @ApiProperty({
    description: 'Giá đến',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceTo?: number;

  @ApiProperty({
    description: 'Sản phẩm nổi bật',
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Sản phẩm mới',
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @ApiProperty({
    description: 'Best seller',
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

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

  @ApiProperty({
    description:
      'Điện áp (CSV): mỗi giá trị OR — LOWER(product.name) LIKE %term% (vd: "12V,24V")',
    required: false,
  })
  @IsString()
  @IsOptional()
  voltageTerms?: string;

  @ApiProperty({
    description:
      'Dung lượng/Ah (CSV): mỗi giá trị OR — LOWER(product.name) LIKE %term% (vd: "60Ah,100Ah")',
    required: false,
  })
  @IsString()
  @IsOptional()
  powerTerms?: string;
}

