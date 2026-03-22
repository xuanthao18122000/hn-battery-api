import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { StatusCommonEnum, VehicleTypeEnum } from 'src/enums';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'Honda City',
    description: 'Tên xe',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'honda-city',
    description: 'Đường dẫn URL của xe',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example: VehicleTypeEnum.CAR,
    description: 'Loại xe: 1 = Moto (xe máy), 2 = Ô tô',
    enum: VehicleTypeEnum,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(VehicleTypeEnum)
  type?: VehicleTypeEnum;

  @ApiProperty({
    example: 'https://example.com/honda-city.jpg',
    description: 'Ảnh đại diện xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({
    example: 'Mô tả về Honda City',
    description: 'Mô tả về xe',
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
  status?: StatusCommonEnum;
}
