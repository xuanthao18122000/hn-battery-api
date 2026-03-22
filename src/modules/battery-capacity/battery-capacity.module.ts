import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryCapacity } from 'src/database/entities';
import { BatteryCapacityService } from './battery-capacity.service';
import { BatteryCapacitySeedService } from './battery-capacity.seed.service';
import { BatteryCapacityCmsController } from './controllers/battery-capacity.cms.controller';
import { BatteryCapacityFeController } from './controllers/battery-capacity.fe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BatteryCapacity])],
  controllers: [BatteryCapacityCmsController, BatteryCapacityFeController],
  providers: [BatteryCapacityService, BatteryCapacitySeedService],
  exports: [BatteryCapacityService],
})
export class BatteryCapacityModule {}
