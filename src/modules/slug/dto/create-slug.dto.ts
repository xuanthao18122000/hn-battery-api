import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  MaxLength,
  IsOptional,
  IsInt,
} from 'class-validator';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';

export class CreateSlugDto {
  @ApiProperty({
    example: SLUG_TYPE_ENUM.PRODUCT,
    description: 'Loại slug',
    enum: SLUG_TYPE_ENUM,
  })
  @IsNotEmpty()
  @IsEnum(SLUG_TYPE_ENUM)
  type: SLUG_TYPE_ENUM;

  @ApiProperty({
    example: 'san-pham-abc',
    description: 'Slug của item',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example: 1,
    description: 'ID của entity tương ứng (product/category/post)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  entityId?: number;
}
