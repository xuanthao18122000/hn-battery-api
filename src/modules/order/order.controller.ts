import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, ListOrderDto, UpdateOrderDto } from './dto';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách đơn hàng' })
  async findAll(@Query() query: ListOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê tổng hợp đơn hàng' })
  async getStats() {
    return this.orderService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn hàng' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng (dùng nội bộ/admin)' })
  async create(@Body() createDto: CreateOrderDto) {
    return this.orderService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn hàng' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateDto);
  }
}

