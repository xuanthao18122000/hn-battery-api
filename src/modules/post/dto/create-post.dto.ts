import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatusCommonEnum } from 'src/enums';

export class CreatePostDto {
  @ApiProperty({
    example: 'Hướng dẫn chọn ắc quy phù hợp cho xe máy',
    description: 'Tiêu đề bài viết',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'huong-dan-chon-ac-quy-phu-hop-cho-xe-may',
    description: 'Đường dẫn URL',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example: '<p>Nội dung đầy đủ của bài viết...</p>',
    description: 'Nội dung đầy đủ (HTML)',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    example: 'Tóm tắt ngắn gọn về nội dung bài viết, hiển thị ở danh sách hoặc thẻ bài viết.',
    description: 'Mô tả ngắn / tóm tắt bài viết',
    required: false,
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    example: 'files/posts/2024/01/image.jpg',
    description: 'Ảnh đại diện bài viết',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  featuredImage?: string;

  @ApiProperty({
    example: 1,
    description: 'ID danh mục bài viết (categories.type = POST)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID tác giả',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @ApiProperty({
    example: StatusCommonEnum.ACTIVE,
    description: 'Trạng thái',
    enum: StatusCommonEnum,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;

  @ApiProperty({
    example: '2024-01-15T00:00:00Z',
    description: 'Ngày xuất bản',
    required: false,
  })
  @IsOptional()
  publishedAt?: Date;

  @ApiProperty({
    example: 'Meta title cho SEO',
    description: 'Meta title',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiProperty({
    example: 'Meta description cho SEO',
    description: 'Meta description',
    required: false,
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiProperty({
    example: 'keyword1, keyword2',
    description: 'SEO keywords',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaKeywords?: string;
}

