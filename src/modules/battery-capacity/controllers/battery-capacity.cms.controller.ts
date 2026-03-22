import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BatteryCapacityService } from '../battery-capacity.service';
import {
  CreateBatteryCapacitiesBulkDto,
  CreateBatteryCapacityDto,
  ListBatteryCapacityDto,
  UpdateBatteryCapacityDto,
} from '../dto';

@ApiBearerAuth()
@ApiTags('Battery capacities (CMS)')
@Controller('battery-capacities')
export class BatteryCapacityCmsController {
  constructor(private readonly service: BatteryCapacityService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách dung lượng ắc quy (phân trang / getFull)' })
  async findAll(@Query() query: ListBatteryCapacityDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo một dung lượng' })
  async create(@Body() dto: CreateBatteryCapacityDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Tạo hàng loạt (trùng tên/slug trong DB hoặc trong batch → bỏ qua)',
  })
  async createBulk(@Body() dto: CreateBatteryCapacitiesBulkDto) {
    return this.service.createBulks(dto.items ?? []);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBatteryCapacityDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bản ghi' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { message: 'Đã xóa dung lượng ắc quy' };
  }
}
