/**
 * Helper functions cho GPS và tính toán khoảng cách
 */

/**
 * Tính khoảng cách giữa hai điểm GPS sử dụng công thức Haversine
 * @param lat1 Vĩ độ điểm 1
 * @param lon1 Kinh độ điểm 1
 * @param lat2 Vĩ độ điểm 2
 * @param lon2 Kinh độ điểm 2
 * @returns Khoảng cách tính bằng mét
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Bán kính trái đất tính bằng mét
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Khoảng cách tính bằng mét
}

/**
 * Kiểm tra xem một điểm có nằm trong bán kính cho phép của điểm khác không
 * @param centerLat Vĩ độ tâm
 * @param centerLon Kinh độ tâm
 * @param pointLat Vĩ độ điểm cần kiểm tra
 * @param pointLon Kinh độ điểm cần kiểm tra
 * @param radius Bán kính cho phép (mét)
 * @returns true nếu điểm nằm trong bán kính, false nếu không
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radius: number,
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radius;
}

/**
 * Kiểm tra xem vị trí chấm công có hợp lệ không
 * @param userLat Vĩ độ vị trí người dùng
 * @param userLon Kinh độ vị trí người dùng
 * @param locationLat Vĩ độ vị trí công ty
 * @param locationLon Kinh độ vị trí công ty
 * @param allowedRadius Bán kính cho phép (mét)
 * @returns Object chứa thông tin kiểm tra
 */
export function validateCheckInLocation(
  userLat: number,
  userLon: number,
  locationLat: number,
  locationLon: number,
  allowedRadius: number,
): {
  isValid: boolean;
  distance: number;
  isWithinRadius: boolean;
} {
  const distance = calculateDistance(
    userLat,
    userLon,
    locationLat,
    locationLon,
  );
  const withinRadius = distance <= allowedRadius;

  return {
    isValid: withinRadius,
    distance: Math.round(distance), // Làm tròn đến mét
    isWithinRadius: withinRadius,
  };
}
