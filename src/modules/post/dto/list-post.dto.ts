import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { StatusCommonEnum, PostTypeEnum } from 'src/enums';

export class ListPostDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Tiêu đề bài viết',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Loại: 1 = Bài viết, 2 = Dịch vụ',
    enum: PostTypeEnum,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(PostTypeEnum)
  @IsOptional()
  type?: PostTypeEnum;

  @ApiProperty({
    description: 'ID danh mục bài viết',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number;

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
    description: 'ID tác giả',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  authorId?: number;
}

