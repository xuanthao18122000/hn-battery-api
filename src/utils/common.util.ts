/**
 * Rounds down a number to the specified number of decimal places.
 *
 * @param {number} number - The number to round down.
 * @param {number} decimals - The number of decimal places to round down to. Defaults to 5 if not provided.
 * @returns {number} - The rounded down number.
 */
export const roundDown = (number: number, decimals: number = 5): number => {
  return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
