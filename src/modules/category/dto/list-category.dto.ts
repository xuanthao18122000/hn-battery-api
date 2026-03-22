import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { CategoryTypeEnum, StatusCommonEnum } from 'src/enums';

export class ListCategoryDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Loại danh mục: 1 = Danh mục (sản phẩm), 2 = Bài viết',
    enum: CategoryTypeEnum,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(CategoryTypeEnum)
  @IsOptional()
  type?: CategoryTypeEnum;

  @ApiProperty({
    description: 'Tên danh mục',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'ID danh mục cha',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({
    description: 'Level của danh mục',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  level?: number;

  @ApiProperty({
    description: 'Trạng thái',
    enum: StatusCommonEnum,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  status?: StatusCommonEnum;
}

