import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SectionDataSourceEnum,
  SectionTypeEnum,
  StatusCommonEnum,
} from 'src/enums';

export class UpdateSectionDto {
  @ApiProperty({ example: SectionTypeEnum.PRODUCT, enum: SectionTypeEnum })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(SectionTypeEnum)
  type?: SectionTypeEnum;

  @ApiProperty({ example: 'TOP Sản Phẩm Ắc Quy Bán Chạy' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: 'top-ban-chay' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiProperty({ example: 'home' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  page?: string;

  @ApiProperty({
    example: SectionDataSourceEnum.MANUAL,
    enum: SectionDataSourceEnum,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(SectionDataSourceEnum)
  dataSource?: SectionDataSourceEnum;

  @ApiProperty({ example: 2, description: 'Số hàng sản phẩm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productRows?: number;

  @ApiProperty({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;

  @ApiProperty({ example: StatusCommonEnum.ACTIVE, enum: StatusCommonEnum })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;
}
