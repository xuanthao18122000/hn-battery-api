export enum FinanceAccountEnum {
  CASH = 'cash',
  BANK = 'bank',
}

export enum FinanceTypeEnum {
  FINANCE_EXTERNAL = 'finance_external',
  FINANCE_INTERNAL = 'finance_internal',
}

export enum FinanceStatusEnum {
  /** Chờ duyệt */
  PENDING = 1,
  /** Đã duyệt */
  APPROVED = 2,
  /** Từ chối */
  REJECTED = 3,
  /** Đang duyệt */
  APPROVING = 4,
}

export enum FinanceObjectTypeEnum {
  /** Chi tạm ứng */
  ADVANCE_PAYMENT = 'advance_payment',
  /** Thu hoàn ứng */
  REFUND_PAYMENT = 'refund_payment',
}
