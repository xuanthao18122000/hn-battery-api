export enum ApplicationType {
  LEAVE = 'LEAVE', // Đơn xin nghỉ
  CHECKIN_OUT = 'CHECKIN_OUT', // Đơn chấm công
}

export enum LeaveType {
  ANNUAL_LEAVE = 'ANNUAL_LEAVE', // Nghỉ phép
  SICK_LEAVE = 'SICK_LEAVE', // Nghỉ ốm
  PERSONAL_LEAVE = 'PERSONAL_LEAVE', // Nghỉ cá nhân
  MATERNITY_LEAVE = 'MATERNITY_LEAVE', // Nghỉ thai sản
  OTHER = 'OTHER', // Khác
}

export enum ApplicationStatus {
  PENDING = 'PENDING', // Chờ duyệt
  APPROVED = 'APPROVED', // Đã duyệt
  REJECTED = 'REJECTED', // Từ chối
}
