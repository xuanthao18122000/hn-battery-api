import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationOptionsDto } from 'src/dto/pagination-query';
import { StatusCommonEnum } from 'src/enums';

export class ListBatteryCapacityDto extends PaginationOptionsDto {
  @ApiPropertyOptional({ description: 'Lọc theo tên (contains)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: StatusCommonEnum })
  @Type(() => Number)
  @IsNumber()
  @IsEnum(StatusCommonEnum)
  @IsOptional()
  status?: StatusCommonEnum;
}
