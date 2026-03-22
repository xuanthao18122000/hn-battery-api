import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandBulkItemDto {
  @ApiProperty({
    example: 'GS',
    description: 'Tên thương hiệu',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'gs',
    description: 'Slug thương hiệu. Nếu bỏ trống hệ thống sẽ tự sinh từ tên.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    example: 'Nhật Bản',
    description: 'Mô tả thương hiệu',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-gs-4.jpg',
    description: 'Logo thương hiệu',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Độ ưu tiên hiển thị',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}

export class CreateBrandsBulkDto {
  @ApiProperty({
    type: [CreateBrandBulkItemDto],
    description: 'Danh sách thương hiệu cần tạo',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBrandBulkItemDto)
  items: CreateBrandBulkItemDto[];
}
