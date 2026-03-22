export enum QuantityReportStatus {
  DRAFT = 'DRAFT', // Nháp
  PENDING = 'PENDING', // Chờ duyệt
  APPROVED = 'APPROVED', // Đã duyệt
  REJECTED = 'REJECTED', // Từ chối
  CANCELLED = 'CANCELLED', // Đã hủy
}

export enum WeatherCondition {
  SUNNY = 'SUNNY', // Nắng
  CLOUDY = 'CLOUDY', // Nhiều mây
  RAINY = 'RAINY', // Mưa
  HEAVY_RAIN = 'HEAVY_RAIN', // Mưa to
  STORM = 'STORM', // Bão
  FOGGY = 'FOGGY', // Sương mù
  WINDY = 'WINDY', // Gió mạnh
  NORMAL = 'NORMAL', // Bình thường
}

export enum ConstructionCondition {
  NORMAL = 'NORMAL', // Bình thường
  DIFFICULT = 'DIFFICULT', // Khó khăn
  VERY_DIFFICULT = 'VERY_DIFFICULT', // Rất khó khăn
  STOPPED = 'STOPPED', // Tạm dừng
  ACCELERATED = 'ACCELERATED', // Tăng tốc
}

export enum IncidentType {
  EQUIPMENT_BREAKDOWN = 'EQUIPMENT_BREAKDOWN', // Hỏng máy
  MATERIAL_SHORTAGE = 'MATERIAL_SHORTAGE', // Thiếu vật liệu
  LABOR_SHORTAGE = 'LABOR_SHORTAGE', // Thiếu nhân công
  WEATHER_ISSUE = 'WEATHER_ISSUE', // Vấn đề thời tiết
  SAFETY_INCIDENT = 'SAFETY_INCIDENT', // Sự cố an toàn
  QUALITY_ISSUE = 'QUALITY_ISSUE', // Vấn đề chất lượng
  OTHER = 'OTHER', // Khác
}

export enum SuggestionType {
  MATERIAL_REQUEST = 'MATERIAL_REQUEST', // Yêu cầu vật liệu
  EQUIPMENT_REQUEST = 'EQUIPMENT_REQUEST', // Yêu cầu thiết bị
  LABOR_REQUEST = 'LABOR_REQUEST', // Yêu cầu nhân công
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT', // Hỗ trợ kỹ thuật
  SCHEDULE_ADJUSTMENT = 'SCHEDULE_ADJUSTMENT', // Điều chỉnh tiến độ
  OTHER = 'OTHER', // Khác
}
