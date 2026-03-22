import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AddSectionItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID item tham chiếu (product/post...)',
  })
  @IsNumber()
  @Type(() => Number)
  refId: number;

  @ApiProperty({ example: 0, description: 'Thứ tự trong block' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;
}
