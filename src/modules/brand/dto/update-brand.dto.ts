import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusCommonEnum } from 'src/enums';

export class UpdateBrandDto {
  @ApiProperty({
    example: 'GS',
    description: 'Tên thương hiệu',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiProperty({
    example: 'gs',
    description: 'Slug thương hiệu',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Logo thương hiệu',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiProperty({
    example: 'Thương hiệu ắc quy GS Nhật Bản',
    description: 'Mô tả thương hiệu',
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
    example: StatusCommonEnum.ACTIVE,
    description: 'Trạng thái',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;
}

