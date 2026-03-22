# Product detail API — breadcrumb + `fromCategory`

## Endpoints

- `GET /fe/products/slug/:slug?fromCategory=<category-slug>` (public)
- `GET /products/slug/:slug?fromCategory=<category-slug>` (CMS, auth)

## Query

| Param           | Required | Meaning                                                                 |
|-----------------|----------|-------------------------------------------------------------------------|
| `fromCategory`  | No       | Slug danh mục user vào từ listing — chọn **nhánh** breadcrumb đúng cách đi. |

## Response (thêm field)

```json
{
  "...product fields": "...",
  "breadcrumb": {
    "items": [
      { "id": 1, "name": "...", "slug": "..." }
    ],
    "source": "from_category" | "default",
    "resolvedFromCategorySlug": "..." | null
  }
}
```

- **`items`**: chuỗi danh mục từ root → leaf (theo `idPath` + leaf), **không** gồm sản phẩm.
- **`source`**: `from_category` nếu `fromCategory` hợp lệ và match được một nhánh; ngược lại `default`.
- **`resolvedFromCategorySlug`**: slug query đã dùng khi `source === 'from_category'`, không thì `null`.

## Logic (server)

1. Load product + `productCategories.category`.
2. Nếu có `fromCategory`: tìm category theo slug (không throw nếu không có — coi như không truyền).
3. Trong các `product_categories`, giữ những dòng mà `category` **nằm dưới** `fromCategory` (theo `idPath` + `id`), chọn **sâu nhất** (`level` max); tie-break: `isPrimary`, `displayOrder`.
4. Nếu không chọn được (không query / slug lạ / không thuộc nhánh): **default** — `isPrimary` trước, rồi `displayOrder`.
5. Build `items` từ leaf đã chọn: parse `idPath` thành chuỗi id, + `leaf.id`, load categories theo thứ tự.

## Frontend

- Listing theo danh mục: link SP dạng `/{productSlug}.html?fromCategory={category.slug}` (đã gắn trong `ProductCard` khi có `rootCategorySlug`).
- Trang SP đọc `searchParams.fromCategory` và gọi `getBySlugFE(..., { fromCategory })`.
