# Category seed: `image` + `description`

## Đã làm

1. **`MockCategorySeedRow`** (`mock-categories.ts`): sửa syntax type (`image` / `description` dùng `;`).

2. **`CategorySeedService.seedFromMock()`**: map thêm `image`, `description` vào rows gửi `importCategoryRows`.

3. **`CategoryService.importCategoryRows()`**:
   - Row type: optional `image?`, `description?`.
   - **Create**: `image` → `thumbnailUrl` (truncate 500), `description` → `description`.
   - **Update**: cập nhật `thumbnailUrl` / `description` khi giá trị seed khác DB.

4. **`syncBrandOrVehicleFromTaxonomy()`**:
   - Chỉ nhận **`image`** từ row (không đẩy `description` sang brand/vehicle — mô tả chỉ lưu trên category).
   - **Brand**: `image` → `logoUrl` trong `createIfNotExistsExactSlug`.
   - **Vehicle** (car/moto): `image` → `imageUrl`.
   - Nếu brand/vehicle **đã tồn tại** (create trả `null`): `applySeedMediaIfEmpty` chỉ bù **logo / ảnh** khi đang trống.

5. **`BrandService.applySeedMediaIfEmpty` / `VehicleService.applySeedMediaIfEmpty`**: bổ sung theo slug.

## Ghi chú

- URL ảnh truncate **500** ký tự (align với column DB).
- Excel import không gửi `image`/`description` → hành vi cũ, không ép field category.

## Verify

```bash
cd ecommerce-api && npx tsc --noEmit
```
