import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../dto';

@Public()
@ApiTags('Orders (FE)')
@Controller('fe/orders')
export class OrderFeController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo đơn hàng từ website (public)',
    description:
      'Endpoint public để trang checkout gửi thông tin đơn hàng. Không yêu cầu đăng nhập.',
  })
  async createPublic(@Body() createDto: CreateOrderDto) {
    return this.orderService.create(createDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng theo ID (public)',
    description: 'Dùng cho trang đặt hàng thành công hiển thị thông tin đơn.',
  })
  async getByIdPublic(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }
}

