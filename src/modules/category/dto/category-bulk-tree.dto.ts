import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { VehicleTypeEnum } from 'src/enums';

/**
 * DTO cho cây danh mục JSON.
 * - `syncBrand`: tạo Brand cùng slug + name với category.
 * - `vehicleType`: 1 = Moto, 2 = Ô tô — tạo Vehicle cùng slug + name.
 * Có thể bật cả hai (brand + vehicle khác bảng, slug trùng).
 */
export class CategoryBulkTreeNodeDto {
  @ApiProperty({ example: 'Ắc quy GS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'ac-quy-gs',
    description: 'Slug danh mục; nếu không có sẽ sinh từ name.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'true = tạo bản ghi Brand (slug/name trùng category)',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  syncBrand?: boolean;

  @ApiPropertyOptional({
    enum: VehicleTypeEnum,
    description: 'Nếu có: tạo Vehicle (1=Moto, 2=Ô tô), slug/name trùng category',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(VehicleTypeEnum)
  vehicleType?: VehicleTypeEnum;

  @ApiPropertyOptional({ description: 'Logo khi syncBrand' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Ảnh khi syncVehicle' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'priority cho brand/vehicle (mặc định thứ tự trong list)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ type: () => [CategoryBulkTreeNodeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryBulkTreeNodeDto)
  children?: CategoryBulkTreeNodeDto[];
}

export class CreateCategoryBulkTreeDto {
  @ApiProperty({ type: [CategoryBulkTreeNodeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CategoryBulkTreeNodeDto)
  items: CategoryBulkTreeNodeDto[];
}
