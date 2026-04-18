import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import {
  ListCustomerDto,
  UpdateCustomerDto,
  ListCustomerOrdersDto,
} from './dto';

@ApiBearerAuth()
@ApiTags('Customers (CMS)')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách khách hàng' })
  async findAll(@Query() query: ListCustomerDto) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết khách hàng theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Danh sách đơn hàng của khách hàng' })
  async findOrders(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListCustomerOrdersDto,
  ) {
    return this.customerService.findOrders(id, query);
  }

  @Get(':id/contacts')
  @ApiOperation({ summary: 'Danh sách yêu cầu liên hệ của khách hàng' })
  async findContacts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListCustomerOrdersDto,
  ) {
    return this.customerService.findContacts(id, query);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật khách hàng' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khách hàng (soft delete)' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.customerService.softDelete(id);
    return { message: 'Xóa khách hàng thành công' };
  }
}
