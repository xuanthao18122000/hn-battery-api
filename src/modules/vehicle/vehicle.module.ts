import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleCmsController } from './controllers/vehicle.cms.controller';
import { VehicleFeController } from './controllers/vehicle.fe.controller';
import { VehicleService } from './vehicle.service';
import { Vehicle } from 'src/database/entities';
import { SlugModule } from '../slug/slug.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), SlugModule],
  controllers: [VehicleCmsController, VehicleFeController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
