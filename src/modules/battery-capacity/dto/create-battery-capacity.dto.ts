import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusCommonEnum } from 'src/enums';

export class CreateBatteryCapacityDto {
  @ApiProperty({
    example: '60Ah',
    description: 'Nhãn hiển thị (dung lượng)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  name: string;

  @ApiPropertyOptional({ example: 9, description: 'Thứ tự sắp xếp' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({
    enum: StatusCommonEnum,
    example: StatusCommonEnum.ACTIVE,
    description: 'Trạng thái',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  status?: StatusCommonEnum;
}
