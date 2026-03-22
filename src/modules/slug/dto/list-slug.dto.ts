import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';

export class ListSlugDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Slug để tìm kiếm',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Loại slug',
    enum: SLUG_TYPE_ENUM,
    required: false,
  })
  @IsEnum(SLUG_TYPE_ENUM)
  @IsOptional()
  type?: SLUG_TYPE_ENUM;
}
