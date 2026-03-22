import { ApiProperty } from '@nestjs/swagger';
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
import { StatusCommonEnum } from 'src/enums';
import { getDefaultBatteryCapacityBulkItems } from '../mock-battery-capacities';

export class CreateBatteryCapacityBulkItemDto {
  @ApiProperty({ example: '60Ah' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  name: string;

  @ApiProperty({ example: 9, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;

  @ApiProperty({
    enum: StatusCommonEnum,
    required: false,
    example: StatusCommonEnum.ACTIVE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;
}

export class CreateBatteryCapacitiesBulkDto {
  @ApiProperty({
    type: [CreateBatteryCapacityBulkItemDto],
    description: 'Danh sách dung lượng (bỏ qua trùng tên)',
    example: {
      items: getDefaultBatteryCapacityBulkItems(),
    },
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBatteryCapacityBulkItemDto)
  items: CreateBatteryCapacityBulkItemDto[];
}
