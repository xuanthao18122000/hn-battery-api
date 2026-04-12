import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  IsInt,
} from 'class-validator';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';

export class UpdateSlugDto {
  @ApiProperty({
    example: SLUG_TYPE_ENUM.PRODUCT,
    description: 'Loại slug',
    enum: SLUG_TYPE_ENUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(SLUG_TYPE_ENUM)
  type?: SLUG_TYPE_ENUM;

  @ApiProperty({
    example: 'san-pham-abc',
    description: 'Slug của item',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({
    example: 1,
    description: 'ID của entity tương ứng (product/category/post)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  entityId?: number;
}
