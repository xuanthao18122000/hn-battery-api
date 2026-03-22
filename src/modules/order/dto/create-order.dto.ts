import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatusEnum, PaymentMethodEnum } from 'src/database/entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({ example: 44131, description: 'ID sản phẩm' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 'Ắc Quy GS MF 115D33C (12V - 100Ah)', description: 'Tên sản phẩm tại thời điểm đặt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  productName: string;

  @ApiProperty({ example: 'ac-quy-gs-mf-115d33c-12v-100ah', description: 'Slug sản phẩm', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productSlug?: string;

  @ApiProperty({ example: 1, description: 'Số lượng' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 2250000, description: 'Đơn giá tại thời điểm đặt' })
  @IsNumber()
  unitPrice: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Thao Nguyen', description: 'Tên khách hàng' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @ApiProperty({ example: '0377682736', description: 'Số điện thoại' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'abc@gmail.com', description: 'Email' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố',
    description: 'Địa chỉ giao hàng',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({
    example: 'Giao giờ hành chính, gọi trước khi giao',
    description: 'Ghi chú của khách hàng',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    example: 2250000,
    description: 'Tổng tiền đơn hàng (tính từ FE hoặc từ server)',
  })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    example: PaymentMethodEnum.COD,
    enum: PaymentMethodEnum,
    description: 'Phương thức thanh toán',
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Danh sách sản phẩm trong đơn hàng',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    example: OrderStatusEnum.NEW,
    enum: OrderStatusEnum,
    description: 'Trạng thái đơn hàng (chỉ dùng nội bộ, FE không cần gửi)',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;
}

