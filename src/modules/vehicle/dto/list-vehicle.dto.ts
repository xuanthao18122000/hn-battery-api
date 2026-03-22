import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { StatusCommonEnum, VehicleTypeEnum } from 'src/enums';

export class ListVehicleDto extends PaginationOptionsDto {
  @ApiProperty({
    description: 'Tên xe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Loại xe: 1 = Moto, 2 = Ô tô',
    enum: VehicleTypeEnum,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(VehicleTypeEnum)
  @IsOptional()
  type?: VehicleTypeEnum;

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
}
