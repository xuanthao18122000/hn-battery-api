export enum AttendanceStatusEnum {
  PROCESSING = 1, //Đang thực hiện
  PROCESSED = 2, //Đã chốt công
  DONE = 3, //Đã chốt đơn
}

export enum AttendanceSummaryStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum CheckInType {
  MOBILE = 'MOBILE', // Chấm công từ điện thoại
  WEB = 'WEB', // Chấm công từ website
}

export enum CheckInApprovalStatus {
  PENDING = 'PENDING', // Chờ duyệt
  APPROVED = 'APPROVED', // Đã duyệt
  REJECTED = 'REJECTED', // Từ chối
}
