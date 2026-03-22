# API — Dung lượng ắc quy (`battery_capacities`)

## Bảng & migration

- Entity: `BatteryCapacity` → table `battery_capacities`
- Chạy migration: `1774100000000-CreateBatteryCapacitiesTable.ts` (+ `1774100000001` nếu DB cũ còn UNIQUE trên `name`/`slug`).
- Không có UNIQUE ở DB; trùng `name`/`slug` chặn trong `BatteryCapacityService`.

## CMS (Bearer)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/battery-capacities` | List (`getFull=true` không phân trang) |
| GET | `/battery-capacities/:id` | Chi tiết |
| POST | `/battery-capacities` | Tạo 1 |
| POST | `/battery-capacities/bulk` | Bulk (Swagger có example đủ 29 dòng Ah) |
| PUT | `/battery-capacities/:id` | Sửa |
| DELETE | `/battery-capacities/:id` | Xóa mềm |

## FE (public)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/fe/battery-capacities` | List chỉ `ACTIVE`; `?getFull=true` |
| POST | `/fe/battery-capacities/seed` | Seed mock (dev/staging) |

## Web client

`ecommerce-web/src/lib/api/battery-capacities.ts` — `batteryCapacitiesApi.getListFe({ getFull: true })`.

## Dữ liệu mẫu

`src/modules/battery-capacity/mock-battery-capacities.ts` — `BATTERY_CAPACITY_LABELS` + `getDefaultBatteryCapacityBulkItems()`.
