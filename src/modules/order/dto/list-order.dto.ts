import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderStatusEnum, PaymentMethodEnum } from 'src/database/entities/order.entity';
import { PaginationOptionsDto } from 'src/dto/pagination-query';

export class ListOrderDto extends PaginationOptionsDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên / số điện thoại / email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrderStatusEnum, description: 'Lọc theo trạng thái đơn hàng' })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional({ enum: PaymentMethodEnum, description: 'Lọc theo phương thức thanh toán' })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;
}

