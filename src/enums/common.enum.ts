export enum DeletedEnum {
  AVAILABLE = 0,
  DELETED = 1,
}

export enum OrderByEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum StatusCommonEnum {
  ACTIVE = 1,
  INACTIVE = -1,
}

/** Loại xe: Moto (xe máy) / Ô tô */
export enum VehicleTypeEnum {
  MOTO = 1,
  CAR = 2,
}

/** Loại category: Danh mục (sản phẩm) hoặc Bài viết */
export enum CategoryTypeEnum {
  CATEGORY = 1,
  POST = 2,
}

/** Loại block: 1 = Sản phẩm, 2 = Bài viết */
export enum SectionTypeEnum {
  PRODUCT = 1,
  POST = 2,
}

/** Nguồn dữ liệu block: 1 = Chọn tay, 2 = Mới nhất */
export enum SectionDataSourceEnum {
  MANUAL = 1,
  LATEST = 2,
}

export enum AffiliateProgramStatusEnum {
  ACTIVE = 1,
  INACTIVE = -1,
  EXPIRED = -2,
}

export enum CommissionStatusAffiliateEnum {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export enum PaymentStatusEnum {
  UNPAID = 1,
  PARTIALLY_PAID = 2,
  PAID = 3,
}
