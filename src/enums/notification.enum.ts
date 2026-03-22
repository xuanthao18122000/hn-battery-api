/**
 * Đối tượng nhận
 * @enum {number}
 */
export enum NotificationTypeReceiverEnum {
  /** Tất cả người dùng */
  ALL = 1,
  /** Riêng tư (Một danh sách người dùng receivers) */
  PRIVATE = 2,
}

/**
 * Loại thông báo
 * @enum {number}
 */
export enum NotificationCategoryEnum {
  /** Công việc */
  WORK = 1,
  /** Duyệt */
  APPROVAL = 2,
}

/**
 * Loại trang redirect
 * @enum {number}
 */
export enum NotificationRedirectTypeEnum {
  /** Đơn từ */
  APPLICATION = 'application',
  /** Phân ca làm việc */
  SHIFT_ASSIGNMENT = 'shift-assignment',
  /** Phiếu chi */
  FINANCE_EXTERNAL = 'finance-external',
  /** Phiếu thu */
  FINANCE_INTERNAL = 'finance-internal',
  /** Xác thực thiết bị */
  USER_DEVICE = 'user-device',
}
