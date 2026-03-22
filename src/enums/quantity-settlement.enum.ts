export enum QuantitySettlementStatus {
  DRAFT = 'DRAFT', // Nháp
  PENDING = 'PENDING', // Chờ duyệt
  APPROVED = 'APPROVED', // Đã duyệt
  REJECTED = 'REJECTED', // Từ chối
  CANCELLED = 'CANCELLED', // Đã hủy
  PAID = 'PAID', // Đã thanh toán
}

export enum QuantitySettlementType {
  ACCEPTANCE = 'ACCEPTANCE', // Nghiệm thu
  PAYMENT = 'PAYMENT', // Thanh toán
  ACCEPTANCE_PAYMENT = 'ACCEPTANCE_PAYMENT', // Nghiệm thu và thanh toán
}

export enum AcceptanceType {
  CONTRACTOR = 'CONTRACTOR', // Nhà thầu tự nhận
  INVESTOR = 'INVESTOR', // Chủ đầu tư nghiệm thu
  SUPERVISOR = 'SUPERVISOR', // Tư vấn giám sát nghiệm thu
}

export enum PaymentType {
  ADVANCE = 'ADVANCE', // Tạm ứng
  PROGRESS = 'PROGRESS', // Thanh toán theo tiến độ
  FINAL = 'FINAL', // Thanh toán cuối cùng
  RETENTION = 'RETENTION', // Thanh toán tiền giữ lại
}

export enum VATType {
  INCLUDED = 'INCLUDED', // Bao gồm VAT
  EXCLUDED = 'EXCLUDED', // Chưa bao gồm VAT
  ZERO = 'ZERO', // Không áp dụng VAT
}

export enum RetentionType {
  FIXED_AMOUNT = 'FIXED_AMOUNT', // Số tiền cố định
  PERCENTAGE = 'PERCENTAGE', // Theo phần trăm
}

export enum AdvanceRecoveryType {
  FIXED_AMOUNT = 'FIXED_AMOUNT', // Số tiền cố định
  ALL_REMAINING = 'ALL_REMAINING', // Thu hồi tất cả tạm ứng chưa thu hồi
  PERCENTAGE = 'PERCENTAGE', // Theo phần trăm
}

export enum QuantityAdjustmentType {
  ALL_ACCEPTED = 'ALL_ACCEPTED', // Thanh toán hết khối lượng nghiệm thu chưa thanh toán
  PERCENTAGE_TOTAL = 'PERCENTAGE_TOTAL', // Theo % khối lượng nghiệm thu tổng
  PERCENTAGE_BATCH = 'PERCENTAGE_BATCH', // Theo % khối lượng nghiệm thu đợt được chọn
}
