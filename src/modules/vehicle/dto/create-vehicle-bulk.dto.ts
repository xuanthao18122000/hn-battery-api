import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleTypeEnum } from 'src/enums';

export class CreateVehicleBulkItemDto {
  @ApiProperty({
    example: 'Ắc quy xe Audi',
    description: 'Tên xe',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'ac-quy-xe-audi',
    description: 'Slug. Nếu bỏ trống hệ thống sẽ tự sinh từ tên.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({
    example: VehicleTypeEnum.CAR,
    description: 'Loại xe: 1 = Moto, 2 = Ô tô',
    enum: VehicleTypeEnum,
  })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(VehicleTypeEnum)
  type: VehicleTypeEnum;

  @ApiPropertyOptional({
    example: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-audi-300x300.jpg',
    description: 'Ảnh đại diện xe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Mô tả (để null nếu không có)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Độ ưu tiên hiển thị (1, 2, 3...)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}

export class CreateVehiclesBulkDto {
  @ApiProperty({
    type: [CreateVehicleBulkItemDto],
    description: 'Danh sách xe cần tạo',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleBulkItemDto)
  items: CreateVehicleBulkItemDto[];
}
