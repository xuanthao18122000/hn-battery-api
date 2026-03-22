import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({
    example: 'Ghi chú cho đơn hàng',
    description: 'Ghi chú',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

