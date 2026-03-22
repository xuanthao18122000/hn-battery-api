export enum LeaveTypeEnum {
  UNPAID_LEAVE = 'UNPAID_LEAVE', // Nghỉ không lương
  ANNUAL_LEAVE = 'ANNUAL_LEAVE', // Nghỉ phép năm
  SICK_LEAVE = 'SICK_LEAVE', // Nghỉ ốm
  PERSONAL_LEAVE = 'PERSONAL_LEAVE', // Nghỉ cá nhân
  OTHER = 'OTHER', // Nghỉ khác
}

export enum LeaveStatusEnum {
  PENDING = 1, // Chờ duyệt
  APPROVED = 2, // Đã duyệt
  REJECTED = 3, // Từ chối
  CANCELLED = 4, // Đã hủy
}
