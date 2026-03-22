/**
 * Danh sách dung lượng ắc quy mặc định (seed / Swagger example).
 */
export const BATTERY_CAPACITY_LABELS: readonly string[] = [
  '7Ah',
  '9Ah',
  '35Ah',
  '40Ah',
  '43Ah',
  '45Ah',
  '50Ah',
  '52Ah',
  '55Ah',
  '60Ah',
  '62Ah',
  '65Ah',
  '70Ah',
  '71Ah',
  '72Ah',
  '74Ah',
  '75Ah',
  '80Ah',
  '85Ah',
  '88Ah',
  '90Ah',
  '95Ah',
  '100Ah',
  '105Ah',
  '110Ah',
  '120Ah',
  '150Ah',
  '200Ah',
  '210Ah',
];

export function getDefaultBatteryCapacityBulkItems(): Array<{
  name: string;
  position: number;
}> {
  return BATTERY_CAPACITY_LABELS.map((name, position) => ({
    name,
    position,
  }));
}
