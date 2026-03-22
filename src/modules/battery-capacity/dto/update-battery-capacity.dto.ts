import { PartialType } from '@nestjs/swagger';
import { CreateBatteryCapacityDto } from './create-battery-capacity.dto';

export class UpdateBatteryCapacityDto extends PartialType(
  CreateBatteryCapacityDto,
) {}
