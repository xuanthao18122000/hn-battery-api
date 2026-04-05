import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { SlugService } from 'src/modules/slug/slug.service';
import { CategoryService } from 'src/modules/category/category.service';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';
import { createPerfLogger } from 'src/helpers/perf-debug';

@Public()
@ApiTags('Resolve')
@Controller('fe/resolve')
export class ResolveController {
  constructor(
    private readonly slugService: SlugService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Resolve slug - Trả về type; khi CATEGORY kèm luôn category + products (1 request cho trang danh mục)',
  })
  async resolveSlug(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const perf = createPerfLogger(`ResolveController.resolveSlug(${slug})`);
    perf('start');

    try {
      const slugEntity = await this.slugService.findBySlug(slug);
      perf('after slugService.findBySlug');

      const payload: { type: number; slug: string; category?: any; products?: any } = {
        type: slugEntity.type,
        slug: slugEntity.slug,
      };

      if (slugEntity.type === SLUG_TYPE_ENUM.CATEGORY) {
        const category = await this.categoryService.findBySlugFe(slug);
        perf('after categoryService.findBySlugFe');
        payload.category = category;
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const productsResponse = await this.categoryService.getProductsByCategorySlug(slug, {
          page: pageNum,
          limit: limitNum,
        });
        perf('after categoryService.getProductsByCategorySlug');
        payload.products = productsResponse?.data ?? productsResponse;
      } else if (slugEntity.type !== SLUG_TYPE_ENUM.PRODUCT) {
        // Slug chỉ hỗ trợ PRODUCT (1) và CATEGORY (2)
        throw new NotFoundException('Không tìm thấy slug này');
      }

      perf('return payload');
      return payload;
    } catch (error) {
      throw new NotFoundException('Không tìm thấy slug này');
    }
  }
}
