import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VehicleService } from '../vehicle.service';
import {
  CreateVehicleBulkItemDto,
  CreateVehicleDto,
  CreateVehiclesBulkDto,
  UpdateVehicleDto,
  ListVehicleDto,
} from '../dto';
import { VehicleTypeEnum } from 'src/enums';

@ApiBearerAuth()
@ApiTags('Vehicles (CMS)')
@Controller('vehicles')
export class VehicleCmsController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách xe' })
  async findAll(@Query() query: ListVehicleDto) {
    return this.vehicleService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết xe theo slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.vehicleService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết xe theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehicleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo xe mới' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo nhiều xe cùng lúc' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              slug: { type: 'string' },
              type: { type: 'number', enum: [1, 2] },
              imageUrl: { type: 'string' },
              priority: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async createBulks(@Body() dto: CreateVehiclesBulkDto) {
    return this.vehicleService.createBulks(dto.items || []);
  }

  @Post('bulk/seed')
  @ApiOperation({
    summary: 'Seed 12 ô tô + 4 xe máy mẫu (description null, priority 1,2,3...). Gọi 1 lần để thêm đủ.',
  })
  async seedDefaultVehicles() {
    const items = [
      ...[
        { name: 'Ắc quy xe Audi', slug: 'ac-quy-xe-audi', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-audi-300x300.jpg', priority: 1 },
        { name: 'Ắc quy xe BMW', slug: 'ac-quy-xe-bmw', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-bmw-1-300x300.jpg', priority: 2 },
        { name: 'Ắc quy xe Chevrolet', slug: 'ac-quy-xe-chevrolet', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-chevrolet-300x300.jpg', priority: 3 },
        { name: 'Ắc quy xe Hyundai', slug: 'ac-quy-xe-hyundai', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-huyndai-6-1-300x300.jpg', priority: 4 },
        { name: 'Ắc quy xe ô tô Honda', slug: 'ac-quy-xe-o-to-honda', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-o-to-honda-300x300.jpg', priority: 5 },
        { name: 'Ắc quy xe Ford', slug: 'ac-quy-xe-ford', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-ford-300x300.jpg', priority: 6 },
        { name: 'Ắc quy xe Kia', slug: 'ac-quy-xe-kia', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-kia-300x300.jpg', priority: 7 },
        { name: 'Ắc quy xe Mazda', slug: 'ac-quy-xe-mazda', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-mazda-6-1-300x300.jpg', priority: 8 },
        { name: 'Ắc quy xe Mercedes', slug: 'ac-quy-xe-mercedes', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-mercedes-1-300x300.jpg', priority: 9 },
        { name: 'Ắc quy xe Mitsubishi', slug: 'ac-quy-xe-mitsubishi', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-mitsubisi-300x300.jpg', priority: 10 },
        { name: 'Ắc quy xe Nissan', slug: 'ac-quy-xe-nissan', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-nissan-300x300.jpg', priority: 11 },
        { name: 'Ắc quy xe Toyota', slug: 'ac-quy-xe-toyota', type: VehicleTypeEnum.CAR, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-toyota-300x300.jpg', priority: 12 },
      ],
      ...[
        { name: 'Ắc quy xe Kawasaki', slug: 'ac-quy-xe-kawasaki', type: VehicleTypeEnum.MOTO, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-kawasaki-300x300.jpg', priority: 1 },
        { name: 'Ắc quy xe Ducati', slug: 'ac-quy-xe-ducati', type: VehicleTypeEnum.MOTO, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-ducati-300x300.jpg', priority: 2 },
        { name: 'Ắc quy xe Harley Davidson', slug: 'ac-quy-xe-harley-davidson', type: VehicleTypeEnum.MOTO, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-harley-davidson-300x300.jpg', priority: 3 },
        { name: 'Ắc quy xe moto BMW', slug: 'ac-quy-xe-mo-to-bmw', type: VehicleTypeEnum.MOTO, imageUrl: 'https://cdn-v2.didongviet.vn/files/preorders/2026/2/15/1/ac-quy-xe-mo-to-bmw-300x300.jpg', priority: 4 },
      ],
    ];
    return this.vehicleService.createBulks(items as CreateVehicleBulkItemDto[]);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin xe' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa xe (soft delete)' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.vehicleService.softDelete(id);
    return { message: 'Xóa xe thành công' };
  }
}
