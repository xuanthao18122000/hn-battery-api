# Removed `ProductVehicle` (product ↔ vehicle junction)

## DB

- New migration: `1774000000000-DropProductVehiclesTable.ts` — `DROP TABLE IF EXISTS product_vehicles`.
- Run migrations on each environment: `npm run typeorm migration:run` (or your project script).

## API

- Deleted: `src/database/entities/product-vehicle.entity.ts`.
- `Product` / `Vehicle`: removed `OneToMany` / relations to `ProductVehicle`.
- `ProductService`: removed `productVehicleRepo`, `findByVehicle`, `addProductToVehicles`, `updateProductVehicles`, `assignProductMotosAndCars`; `findOne` relations chỉ còn categories.
- `ProductController`: removed `GET products/vehicle/:vehicleId`, `PUT products/:id/vehicles`.
- `VehicleService`: removed `getProductsByVehicleSlug` và dependency `ProductService`.
- `VehicleModule`: removed `ProductModule` import.
- `VehicleFeController`: removed `GET fe/vehicles/slug/:slug/products`.
- Deleted DTO: `update-product-vehicles.dto.ts`.

## Web (`ecommerce-web`)

- `lib/api/products.ts`: dropped `productVehicles` / `productMotos` / `productCars` types và `updateVehicles`.
- `ProductForm`: removed multi-select “Dòng xe (Xe máy / Ô tô)”.

## Still available

- Bảng `vehicles` và CRUD/CMS/FE list xe — chỉ không còn gán sản phẩm ↔ xe qua bảng nối.
