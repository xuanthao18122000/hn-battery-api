/**
 * Utility functions for distance formatting
 */

/**
 * Format distance in meters to human-readable string
 * If distance >= 1000m, convert to km with 1 decimal place
 * @param distanceInMeters - Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters >= 1000) {
    const distanceInKm = distanceInMeters / 1000;
    return `${distanceInKm.toFixed(1)}km`;
  }
  
  return `${Math.ceil(distanceInMeters)}m`;
}

/**
 * Format remaining distance for check-in validation
 * @param remainingDistanceInMeters - Remaining distance in meters
 * @returns Formatted remaining distance string
 */
export function formatRemainingDistance(remainingDistanceInMeters: number): string {
  return formatDistance(remainingDistanceInMeters);
}
