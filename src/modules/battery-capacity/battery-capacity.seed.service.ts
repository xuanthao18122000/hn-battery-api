import { Injectable } from '@nestjs/common';
import { BatteryCapacityService } from './battery-capacity.service';
import { getDefaultBatteryCapacityBulkItems } from './mock-battery-capacities';

@Injectable()
export class BatteryCapacitySeedService {
  constructor(private readonly batteryCapacityService: BatteryCapacityService) {}

  /** Seed đủ bảng dung lượng từ `mock-battery-capacities.ts` (bỏ qua trùng). */
  async seedFromMock() {
    const items = getDefaultBatteryCapacityBulkItems();
    const created = await this.batteryCapacityService.createBulks(items);
    return {
      requested: items.length,
      createdCount: created.length,
      skippedCount: items.length - created.length,
    };
  }
}
