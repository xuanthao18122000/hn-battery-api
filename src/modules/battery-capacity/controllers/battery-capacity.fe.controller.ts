import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { StatusCommonEnum } from 'src/enums';
import { BatteryCapacityService } from '../battery-capacity.service';
import { BatteryCapacitySeedService } from '../battery-capacity.seed.service';
import { ListBatteryCapacityDto } from '../dto';

@Public()
@ApiTags('Battery capacities (FE)')
@Controller('fe/battery-capacities')
export class BatteryCapacityFeController {
  constructor(
    private readonly service: BatteryCapacityService,
    private readonly seedService: BatteryCapacitySeedService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách dung lượng ắc quy (public, chỉ ACTIVE). Dùng getFull=true để lấy hết.',
  })
  async getList(@Query() query: ListBatteryCapacityDto) {
    return this.service.findAll({
      ...query,
      status: StatusCommonEnum.ACTIVE,
    });
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed từ mock (public — dev/staging)',
  })
  async seedFromMock() {
    return this.seedService.seedFromMock();
  }
}
