export enum DocumentType {
  REPLY = 'REPLY', // Phúc đáp
  CORRECTION_REMINDER = 'CORRECTION_REMINDER', // Chấn chỉnh/nhắc nhở
  EXPLANATION = 'EXPLANATION', // Giải thích
  NOTIFICATION = 'NOTIFICATION', // Thông báo
  REPORT = 'REPORT', // Giải trình
  REQUEST = 'REQUEST', // Đề nghị
}

export enum DocumentStatus {
  DRAFT = 'DRAFT', // Nháp
  SENT = 'SENT', // Đã gửi
  RECEIVED = 'RECEIVED', // Đã nhận
  ARCHIVED = 'ARCHIVED', // Đã lưu trữ
  CANCELLED = 'CANCELLED', // Hủy bỏ
}

export enum SecurityLevel {
  NORMAL = 'NORMAL', // Bình thường
  HIGH = 'HIGH', // Cao
}

export enum UrgencyLevel {
  NORMAL = 'NORMAL', // Bình thường
  HIGH = 'HIGH', // Cao
}

export enum DocumentDirection {
  INCOMING = 'INCOMING', // Văn bản đến
  OUTGOING = 'OUTGOING', // Văn bản đi
}
