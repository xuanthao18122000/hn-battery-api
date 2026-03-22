import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto';
import { ProductService } from './product.service';

import { getMockProducts } from './mock-products';

@Injectable()
export class ProductSeedService {
  constructor(private readonly productService: ProductService) {}

  async createBulksFromMock(limit?: number) {
    const list = getMockProducts() ?? [];
    const toSeed = typeof limit === 'number' && limit > 0 ? list.slice(0, limit) : list;

    if (toSeed.length === 0) {
      return {
        total: 0,
        created: 0,
        skipped: 0,
        errors: [],
      };
    }

    let created = 0;
    let skipped = 0;
    const errors: Array<{ slug?: string; sku?: string; message: string }> = [];

    for (const item of toSeed) {
      const name = item.name ?? item.product;
      const slug = item.slug;
      const sku = item.sku;

      if (!name || !slug || !sku) {
        skipped += 1;
        continue;
      }

      const dto: CreateProductDto = {
        name,
        slug,
        sku,
        price: item.price,
        salePrice: typeof item.salePrice === 'number' ? item.salePrice : undefined,
        stockQuantity: typeof item.stockQuantity === 'number' ? item.stockQuantity : 0,
        thumbnailUrl: item.thumbnailUrl ?? item.thumbnail,
        description: item.description,
        showPrice: typeof item.showPrice === 'boolean' ? item.showPrice : true,
        metaRobots: item.metaRobots ?? 'index,follow',
        categoryIds: Array.isArray(item.categoryIds) ? item.categoryIds : undefined,
      };

      try {
        await this.productService.create(dto);
        created += 1;
      } catch (err: any) {
        const message = err?.message || 'Unknown error';
        const msgLower = String(message).toLowerCase();
        const isDup =
          msgLower.includes('slug') ||
          msgLower.includes('sku') ||
          msgLower.includes('đã tồn tại');

        if (isDup) {
          skipped += 1;
          continue;
        }

        errors.push({ slug, sku, message });
      }
    }

    return { total: toSeed.length, created, skipped, errors };
  }

  async resetAndSeedFromMock() {
    // Not implemented yet: hard delete/soft delete will likely require slug cleanup.
    throw new BadRequestException('resetAndSeedFromMock is not implemented');
  }
}

