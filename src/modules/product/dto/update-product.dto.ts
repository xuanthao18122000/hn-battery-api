import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { StatusCommonEnum } from 'src/enums';

export class UpdateProductDto {
  @ApiProperty({
    example: 'iPhone 15 Pro Max 256GB',
    description: 'Tên sản phẩm',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'iphone-15-pro-max-256gb',
    description: 'Đường dẫn URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: 'IP15PM256',
    description: 'Mã SKU',
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    example: 'Mô tả ngắn',
    description: 'Mô tả ngắn',
    required: false,
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    example: '<p>Mô tả chi tiết</p>',
    description: 'Mô tả chi tiết (HTML)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 29990000,
    description: 'Giá gốc',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 27990000,
    description: 'Giá khuyến mãi',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiProperty({
    example: 25000000,
    description: 'Giá vốn',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({
    example: 100,
    description: 'Số lượng tồn kho',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({
    example: 'cái',
    description: 'Đơn vị tính',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    example: 0.221,
    description: 'Trọng lượng (kg)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiProperty({
    example: 15.5,
    description: 'Chiều dài (cm)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  length?: number;

  @ApiProperty({
    example: 7.5,
    description: 'Chiều rộng (cm)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  width?: number;

  @ApiProperty({
    example: 0.8,
    description: 'Chiều cao (cm)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Ảnh đại diện',
    required: false,
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({
    example: ['https://example.com/image1.jpg'],
    description: 'Danh sách ảnh',
    required: false,
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({
    example: 1,
    description: 'ID thương hiệu (brands.id)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @ApiProperty({
    example: 12,
    description: 'ID dung lượng ắc quy (battery_capacities.id)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  batteryCapacityId?: number;

  @ApiProperty({
    example: 'Trung Quốc',
    description: 'Xuất xứ',
    required: false,
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({
    example: '0123456789',
    description: 'Mã vạch',
    required: false,
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    example: 0,
    description: 'Độ ưu tiên',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;

  @ApiProperty({
    example: false,
    description: 'Sản phẩm nổi bật',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    example: true,
    description: 'Sản phẩm mới',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiProperty({
    example: false,
    description: 'Best seller',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @ApiProperty({
    example: true,
    description: 'Hiển thị giá (false = hiện Liên hệ)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showPrice?: boolean;

  @ApiProperty({
    example: {
    colors: ['Đen', 'Trắng'],
    },
    description: 'Thuộc tính',
    required: false,
  })
  @IsOptional()
  attributes?: object;

  @ApiProperty({
    example: {
      screen: '6.7 inch',
    },
    description: 'Thông số kỹ thuật',
    required: false,
  })
  @IsOptional()
  specifications?: object;

  @ApiProperty({
    example: 'Meta title',
    description: 'Meta title',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Meta description',
    description: 'Meta description',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    example: 'keywords',
    description: 'Keywords',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({
    example: 'index,follow',
    description: 'Meta robots',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaRobots?: string;

  @ApiProperty({
    example: 'https://example.com/product',
    description: 'Canonical URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiProperty({
    example: {},
    description: 'Schema.org',
    required: false,
  })
  @IsOptional()
  seoBaseSchema?: object;

  @ApiProperty({
    example: StatusCommonEnum.ACTIVE,
    description: 'Trạng thái',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;

  @ApiProperty({
    example: [5, 8],
    description: 'Danh sách ID danh mục',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  categoryIds?: number[];
}

