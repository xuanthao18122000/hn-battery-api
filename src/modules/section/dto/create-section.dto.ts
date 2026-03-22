import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
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

export class CreateSectionDto {
  @ApiProperty({
    example: SectionTypeEnum.PRODUCT,
    enum: SectionTypeEnum,
    description: 'Loại block: 1 = Sản phẩm, 2 = Bài viết',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(SectionTypeEnum)
  type?: SectionTypeEnum;

  @ApiProperty({
    example: 'TOP Sản Phẩm Ắc Quy Bán Chạy',
    description: 'Tên block',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'top-ban-chay', description: 'Code dùng cho API' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ example: 'home', description: 'Trang hiển thị' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  page?: string;

  @ApiProperty({
    example: SectionDataSourceEnum.MANUAL,
    enum: SectionDataSourceEnum,
    description: 'Nguồn dữ liệu: 1 = Chọn tay, 2 = Mới nhất',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(SectionDataSourceEnum)
  dataSource?: SectionDataSourceEnum;

  @ApiProperty({
    example: 2,
    description: 'Số hàng sản phẩm (chỉ block loại Sản phẩm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productRows?: number;

  @ApiProperty({ example: 0, description: 'Thứ tự block' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;

  @ApiProperty({
    example: StatusCommonEnum.ACTIVE,
    enum: StatusCommonEnum,
    description: 'Trạng thái',
  })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;
}
