export const maskString = (
  str: string,
  maskLength: number = 3,
  maskChar: string = '*',
): string => {
  if (!str || typeof str !== 'string' || str.length < maskLength) {
    return '';
  }
  const visiblePart = str.slice(-maskLength);
  const maskedPart = maskChar.repeat(str.length - maskLength);
  return maskedPart + visiblePart;
};
