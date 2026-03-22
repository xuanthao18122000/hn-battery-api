import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CategoryTypeEnum } from 'src/enums';

export class CreateCategoryDto {
  @ApiProperty({
    example: 1,
    description: 'ID danh mục cha',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    example: CategoryTypeEnum.CATEGORY,
    description: 'Loại: 1 = Danh mục (sản phẩm), 2 = Bài viết',
    enum: CategoryTypeEnum,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(CategoryTypeEnum)
  type?: CategoryTypeEnum;

  @ApiProperty({
    example: 'Điện thoại & Phụ kiện',
    description: 'Tên danh mục',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'dien-thoai-phu-kien',
    description: 'Đường dẫn url của danh mục',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example: 'Danh mục điện thoại và phụ kiện chính hãng',
    description: 'Mô tả danh mục (HTML)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 0,
    description: 'Độ ưu tiên hiển thị',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;

  @ApiProperty({
    example: 0,
    description: 'Vị trí sắp xếp (số nhỏ hiển thị trước)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;

  @ApiProperty({
    example: 'https://example.com/icon.svg',
    description: 'Icon hiển thị danh mục',
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
    description: 'Ảnh đại diện của danh mục',
    required: false,
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({
    example: 'https://example.com/dien-thoai-phu-kien',
    description: 'URL chính thức (cho duplicate content)',
    required: false,
  })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiProperty({
    example: 'Điện thoại & Phụ kiện | Shop ABC',
    description: 'Meta title cho SEO',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiProperty({
    example: 'Mua sắm điện thoại và phụ kiện chính hãng với giá tốt nhất',
    description: 'Meta description cho SEO',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    example: 'điện thoại, phụ kiện, smartphone',
    description: 'Keywords cho SEO',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({
    example: 'index,follow',
    description: 'Meta robots cho SEO',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaRobots?: string;

  @ApiProperty({
    example: { '@type': 'ProductCategory', name: 'Điện thoại' },
    description: 'Schema.org cho category',
    required: false,
  })
  @IsOptional()
  seoBaseSchema?: object;
}

