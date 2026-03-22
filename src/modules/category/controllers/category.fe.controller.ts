import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { CategoryService } from '../category.service';
import { CategorySeedService } from '../category.seed.service';
import { ListProductDto } from 'src/modules/product/dto';
import { ListCategoryDto } from '../dto';

@Public()
@ApiTags('Categories (FE)')
@Controller('fe/categories')
export class CategoryFeController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categorySeedService: CategorySeedService,
  ) {}

  @Get('slug/:slug/products')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm theo category slug (Public)' })
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query() query: ListProductDto,
  ) {
    return await this.categoryService.getProductsByCategorySlug(slug, query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết category theo slug (Public)' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findBySlug(slug);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy cây danh mục (Public)' })
  async getCategoryTree(@Query() query: ListCategoryDto) {
    return await this.categoryService.getCategoryTree(query,{ useCache: false });
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed danh mục từ mock-categories.ts (Public — dev/staging)',
  })
  async seedFromMock() {
    return this.categorySeedService.seedFromMock();
  }
}
