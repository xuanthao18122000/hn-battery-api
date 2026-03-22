import { Injectable } from '@nestjs/common';
import { CategoryService } from './category.service';
import { getMockCategories } from './mock-categories';

@Injectable()
export class CategorySeedService {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Seed danh mục từ `mock-categories.ts` (cùng luồng upsert với import Excel).
   */
  async seedFromMock() {
    const rows = getMockCategories().map((r) => ({
      code: r.code,
      name: r.name,
      slug: r.slug,
      position: r.position,
      taxonomy: r.taxonomy,
      image: r.image,
      description: r.description,
    }));
    return this.categoryService.importCategoryRows(rows);
  }
}
