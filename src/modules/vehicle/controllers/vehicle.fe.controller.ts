import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { VehicleService } from '../vehicle.service';
import { ListVehicleDto } from '../dto';
import { StatusCommonEnum } from 'src/enums';

@Public()
@ApiTags('Vehicles (FE)')
@Controller('fe/vehicles')
export class VehicleFeController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách xe (public, chỉ ACTIVE, có thể lọc theo type)' })
  async getList(@Query() query: ListVehicleDto) {
    return this.vehicleService.findAll({
      ...query,
      status: StatusCommonEnum.ACTIVE,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết xe theo slug (Public)' })
  async getVehicleBySlug(@Param('slug') slug: string) {
    return this.vehicleService.findBySlug(slug);
  }
}
