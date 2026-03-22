/** Enum trạng thái hợp đồng */
export enum ContractStatus {
  DRAFT = 'DRAFT', // Nháp
  PENDING_SIGNATURE = 'PENDING_SIGNATURE', // Chờ ký
  ACTIVE = 'ACTIVE', // Đang thực hiện
  SUSPENDED = 'SUSPENDED', // Tạm dừng
  COMPLETED = 'COMPLETED', // Hoàn thành
  TERMINATED = 'TERMINATED', // Chấm dứt
  CANCELLED = 'CANCELLED', // Hủy bỏ
}

/** Enum loại hợp đồng */
export enum ContractType {
  BIDDING = 'BIDDING', // Hợp đồng giao thầu
  RECEIVING = 'RECEIVING', // Hợp đồng nhận thầu
}
