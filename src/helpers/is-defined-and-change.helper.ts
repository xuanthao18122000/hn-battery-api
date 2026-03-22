/**
 * Kiểm tra xem giá trị mới có được xác định và khác với giá trị hiện tại hay không
 * @param currentValue Giá trị hiện tại để so sánh
 * @param newValue Giá trị mới tiềm năng cần kiểm tra
 * @returns True nếu newValue được xác định và khác với currentValue
 */
export function isValueDefinedAndChanged<T>(
  currentValue: T,
  newValue: T | undefined,
): newValue is T {
  return newValue !== undefined && currentValue !== newValue;
}
