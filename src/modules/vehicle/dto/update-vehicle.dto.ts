import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusCommonEnum, VehicleTypeEnum } from 'src/enums';

export class UpdateVehicleDto {
  @ApiProperty({
    example: 'Honda City',
    description: 'Tên xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'honda-city',
    description: 'Đường dẫn URL của xe',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: VehicleTypeEnum.CAR,
    description: 'Loại xe: 1 = Moto, 2 = Ô tô',
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
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;
}
