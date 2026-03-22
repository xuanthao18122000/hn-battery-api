import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSectionItemDto {
  @ApiProperty({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;
}
