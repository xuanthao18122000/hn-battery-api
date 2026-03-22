export enum ProposalTypeEnum {
  MATERIAL_SUPPLY = 'MATERIAL_SUPPLY', // Đề xuất cấp vật tư
  EQUIPMENT_SUPPLY = 'EQUIPMENT_SUPPLY', // Đề xuất cấp thiết bị
  WORKER_SUPPLY = 'WORKER_SUPPLY', // Đề xuất cấp công nhân
  PAYMENT_REQUEST = 'PAYMENT_REQUEST', // Đề nghị thanh toán
  FUEL_ALLOCATION = 'FUEL_ALLOCATION', // Đề xuất phân bổ nhiên liệu

  CONSTRUCTION_ADVANCE = 'CONSTRUCTION_ADVANCE', // Tạm ứng chi phí công trình
  BUSINESS_TRIP_ADVANCE = 'BUSINESS_TRIP_ADVANCE', // Tạm ứng chi phí công tác
}

export enum ProposalStatusEnum {
  REJECTED = 'REJECTED', // Từ chối
  PENDING = 'PENDING', // Chờ duyệt
  APPROVED = 'APPROVED', // Đã duyệt
  EXPLAINED = 'EXPLAINED', // Đã giải trình
}

export enum ProposalDetailStatusEnum {
  PENDING = 'PENDING', // Chờ duyệt
  APPROVED = 'APPROVED', // Đã duyệt (chưa cấp)
  REJECTED = 'REJECTED', // Đã từ chối
  CANCELLED = 'CANCELLED', // Đã hủy
  COMPLETED = 'COMPLETED', // Đã cấp
}
