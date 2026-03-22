# Category bulk tree + Brand / Vehicle sync

## Endpoint

`POST /categories/bulk/tree` (CMS, Bearer auth)

Body:

```json
{
  "items": [
    {
      "name": "Thương hiệu Ắc quy",
      "slug": "thuong-hieu-ac-quy",
      "children": [
        {
          "name": "Ắc quy GS",
          "slug": "ac-quy-gs",
          "syncBrand": true
        }
      ]
    },
    {
      "name": "Ắc quy mô tô",
      "slug": "ac-quy-mo-to",
      "children": [
        {
          "name": "Ắc quy xe Kawasaki",
          "slug": "ac-quy-xe-kawasaki",
          "vehicleType": 1
        }
      ]
    },
    {
      "name": "Ắc quy ô tô",
      "slug": "ac-quy-o-to",
      "children": [
        {
          "name": "Ắc quy Volvo",
          "slug": "ac-quy-volvo",
          "vehicleType": 2
        }
      ]
    }
  ]
}
```

## Fields trên mỗi node

| Field | Ý nghĩa |
|-------|---------|
| `name` | Bắt buộc |
| `slug` | Tuỳ chọn; không có thì sinh từ `name` |
| `syncBrand` | `true` → tạo **Brand** cùng `name` + **slug** với category (nếu chưa tồn tại slug/name) |
| `vehicleType` | `1` = Moto, `2` = Ô tô → tạo **Vehicle** cùng slug (nếu slug vehicle chưa có) |
| `logoUrl` | Khi `syncBrand` |
| `imageUrl` | Khi `vehicleType` |
| `priority` | Brand / Vehicle (mặc định = index trong list anh em) |
| `children` | Cây con |

Có thể vừa `syncBrand` vừa `vehicleType` trên một node (hai bảng khác nhau, slug trùng được).

## Bỏ qua "Kinh nghiệm hay"

Node có slug `kinh-nghiem-hay` (hoặc name sinh ra slug đó) **không** tạo category và **không** duyệt `children` (nếu có).

## Response (gợi ý)

- `categoriesCreated`, `categoriesUpdated`
- `brandsCreated`, `vehiclesCreated`
- `skippedNodes`, `skippedCount`

## Ghi chú

- Slug category trùng DB thì **update** name/parent/position (giống flow import Excel).
- Brand: nếu đã có slug **hoặc** đã có name → không tạo mới.
- Vehicle: nếu đã có slug → không tạo mới.
- Nếu slug category phải sinh bản ghi unique (`xxx-1`), Brand/Vehicle dùng đúng slug cuối đó.
