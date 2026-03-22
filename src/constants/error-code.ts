export interface ErrorDetail {
  code: string;
  message: string;
}

export const SUCCESS_CODE = 'SUCCESS';

export const ErrorCode = {
  // HTTP Errors
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Yêu cầu không hợp lệ',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Không có quyền truy cập',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Truy cập bị từ chối',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Không tìm thấy tài nguyên',
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Dữ liệu đã tồn tại',
  },

  STAFF_NOT_FOUND: {
    code: 'STAFF_NOT_FOUND',
    message: 'Không tìm thấy nhân viên',
  },

  // User Errors
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'Không tìm thấy người dùng',
  },
  USER_EXISTED: {
    code: 'USER_EXISTED',
    message: 'Người dùng đã tồn tại',
  },
  USER_EMAIL_EXISTED: {
    code: 'USER_EMAIL_EXISTED',
    message: 'Email người dùng đã tồn tại!',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Email hoặc mật khẩu không đúng',
  },

  // Affiliate Errors
  AFFILIATE_NOT_FOUND: {
    code: 'AFFILIATE_NOT_FOUND',
    message: 'Không tìm thấy tài khoản',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Token đã hết hạn',
  },

  // Other Errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Lỗi xác thực dữ liệu',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Lỗi khi thao tác với cơ sở dữ liệu',
  },
  OTHER: {
    code: 'OTHER',
    message: 'Lỗi không xác định',
  },

  // Mã lỗi liên quan đến role
  ROLE_NOT_FOUND: {
    code: 'ROLE_NOT_FOUND',
    message: 'Vai trò không tồn tại',
  },
  ROLE_CODE_ALREADY_EXISTS: {
    code: 'ROLE_CODE_ALREADY_EXISTS',
    message: 'Mã vai trò đã tồn tại',
  },
  ROLE_NAME_ALREADY_EXISTS: {
    code: 'ROLE_NAME_ALREADY_EXISTS',
    message: 'Tên vai trò đã tồn tại',
  },
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm',
  },

  // Category Errors
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    message: 'Không tìm thấy danh mục',
  },

  // Vehicle Errors
  VEHICLE_NOT_FOUND: {
    code: 'VEHICLE_NOT_FOUND',
    message: 'Không tìm thấy xe',
  },

  // Slug Errors
  SLUG_NOT_FOUND: {
    code: 'SLUG_NOT_FOUND',
    message: 'Không tìm thấy slug',
  },

  // Fuel Inventory Errors
  FUEL_INVENTORY_NOT_FOUND: {
    code: 'FUEL_INVENTORY_NOT_FOUND',
    message: 'Không tìm thấy kho nhiên liệu',
  },

  // Fuel Allocation Errors
  FUEL_ALLOCATION_NOT_FOUND: {
    code: 'FUEL_ALLOCATION_NOT_FOUND',
    message: 'Không tìm thấy phân bổ nhiên liệu',
  },

  // Auth Errors
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Tài khoản đã bị khóa',
  },
  INVALID_TOKEN_TYPE: {
    code: 'INVALID_TOKEN_TYPE',
    message: 'Invalid token type',
  },
  REFRESH_TOKEN_NOT_FOUND: {
    code: 'REFRESH_TOKEN_NOT_FOUND',
    message: 'Refresh token not found',
  },
  USER_NOT_FOUND_OR_INACTIVE: {
    code: 'USER_NOT_FOUND_OR_INACTIVE',
    message: 'Tài khoản không tồn tại hoặc đã bị khóa',
  },
  INVALID_USER: {
    code: 'INVALID_USER',
    message: 'Người dùng không hợp lệ',
  },
  CURRENT_PASSWORD_INCORRECT: {
    code: 'CURRENT_PASSWORD_INCORRECT',
    message: 'Mật khẩu hiện tại không đúng',
  },

  POSITION_NOT_FOUND: {
    code: 'POSITION_NOT_FOUND',
    message: 'Không tìm thấy chức vụ',
  },

  TIME_SHEET_NOT_FOUND: {
    code: 'TIMESHEET_NOT_FOUND',
    message: 'Không tìm thấy chấm công',
  },

  ALREADY_CHECKED_IN: {
    code: 'ALREADY_CHECKED_IN',
    message: 'Bạn đã check-in hôm nay',
  },
  NOT_CHECKED_IN: {
    code: 'NOT_CHECKED_IN',
    message: 'Bạn chưa check-in hôm nay',
  },
  ALREADY_CHECKED_OUT: {
    code: 'ALREADY_CHECKED_OUT',
    message: 'Bạn đã check-out hôm nay',
  },

  PROJECT_TYPE_NOT_FOUND: {
    code: 'PROJECT_TYPE_NOT_FOUND',
    message: 'Không tìm thấy loại dự án',
  },

  PROJECT_GROUP_NOT_FOUND: {
    code: 'PROJECT_GROUP_NOT_FOUND',
    message: 'Không tìm thấy nhóm dự án',
  },
  PROJECT_CODE_EXISTED: {
    code: 'PROJECT_CODE_EXISTED',
    message: 'Mã dự án đã tồn tại',
  },

  DEPARTMENT_NOT_FOUND: {
    code: 'DEPARTMENT_NOT_FOUND',
    message: 'Không tìm thấy phòng ban',
  },

  MATERIAL_NOT_FOUND: {
    code: 'MATERIAL_NOT_FOUND',
    message: 'Không tìm thấy vật tư',
  },

  FINANCE_RECIPIENT_NOT_FOUND: {
    code: 'FINANCE_RECIPIENT_NOT_FOUND',
    message: 'Không tìm thấy đối tượng thu chi',
  },
  FINANCE_RECIPIENT_KEY_EXISTED: {
    code: 'FINANCE_RECIPIENT_KEY_EXISTED',
    message: 'Mã đối tượng thu chi đã tồn tại',
  },

  PROVIDER_NOT_FOUND: {
    code: 'PROVIDER_NOT_FOUND',
    message: 'Không tìm thấy nhà cung cấp',
  },
  PROVIDER_CODE_EXISTED: {
    code: 'PROVIDER_CODE_EXISTED',
    message: 'Mã nhà cung cấp đã tồn tại',
  },

  CUSTOMER_NOT_FOUND: {
    code: 'CUSTOMER_NOT_FOUND',
    message: 'Không tìm thấy khách hàng',
  },

  WAREHOUSE_NOT_FOUND: {
    code: 'WAREHOUSE_NOT_FOUND',
    message: 'Không tìm thấy kho hàng',
  },
  WAREHOUSE_CODE_EXISTED: {
    code: 'WAREHOUSE_CODE_EXISTED',
    message: 'Mã kho hàng đã tồn tại',
  },

  WORK_ITEM_NOT_FOUND: {
    code: 'WORK_ITEM_NOT_FOUND',
    message: 'Không tìm thấy hạng mục công việc',
  },

  WORKER_REPORT_NOT_FOUND: {
    code: 'WORKER_REPORT_NOT_FOUND',
    message: 'Không tìm thấy báo cáo nhân công',
  },

  DOCUMENT_NOT_FOUND: {
    code: 'DOCUMENT_NOT_FOUND',
    message: 'Không tìm thấy văn bản',
  },
  DOCUMENT_NUMBER_EXISTED: {
    code: 'DOCUMENT_NUMBER_EXISTED',
    message: 'Số văn bản đã tồn tại',
  },

  STOCK_TRANSACTION_NOT_FOUND: {
    code: 'STOCK_TRANSACTION_NOT_FOUND',
    message: 'Không tìm thấy giao dịch kho',
  },
  STOCK_TRANSACTION_NUMBER_EXISTED: {
    code: 'STOCK_TRANSACTION_NUMBER_EXISTED',
    message: 'Mã giao dịch kho đã tồn tại',
  },

  // Company Location
  COMPANY_LOCATION_NOT_FOUND: {
    code: 'COMPANY_LOCATION_NOT_FOUND',
    message: 'Vị trí công ty không tồn tại',
  },

  LEAVE_REQUEST_NOT_FOUND: {
    code: 'LEAVE_REQUEST_NOT_FOUND',
    message: 'Không tìm thấy đơn xin nghỉ phép',
  },

  PROJECT_NOT_FOUND: {
    code: 'PROJECT_NOT_FOUND',
    message: 'Không tìm thấy dự án',
  },

  CONTRACT_NOT_FOUND: {
    code: 'CONTRACT_NOT_FOUND',
    message: 'Không tìm thấy hợp đồng',
  },
  CONTRACT_CODE_EXISTED: {
    code: 'CONTRACT_CODE_EXISTED',
    message: 'Mã hợp đồng đã tồn tại',
  },

  // Brand Errors
  BRAND_NOT_FOUND: {
    code: 'BRAND_NOT_FOUND',
    message: 'Không tìm thấy thương hiệu',
  },

  BATTERY_CAPACITY_NOT_FOUND: {
    code: 'BATTERY_CAPACITY_NOT_FOUND',
    message: 'Không tìm thấy dung lượng ắc quy',
  },
};
