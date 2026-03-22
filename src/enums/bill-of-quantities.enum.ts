/** Enum trạng thái bảng khối lượng */
export enum BillOfQuantitiesStatus {
  PENDING = 'PENDING', // Chờ thực hiện
  IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện
  COMPLETED = 'COMPLETED', // Hoàn thành
  SUSPENDED = 'SUSPENDED', // Tạm dừng
  CANCELLED = 'CANCELLED', // Hủy bỏ
}
