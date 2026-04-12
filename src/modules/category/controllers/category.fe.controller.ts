import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { CategoryService } from '../category.service';
import { CategorySeedService } from '../category.seed.service';
import { ProductService } from 'src/modules/product/product.service';
import { ListProductDto } from 'src/modules/product/dto';
import { ListCategoryDto } from '../dto';

@Public()
@ApiTags('Categories (FE)')
@Controller('fe/categories')
export class CategoryFeController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categorySeedService: CategorySeedService,
    private readonly productService: ProductService,
  ) {}

  @Get('tree')
  @ApiOperation({ summary: 'Lấy cây danh mục (Public)' })
  async getCategoryTree(@Query() query: ListCategoryDto) {
    return await this.categoryService.getCategoryTree(query, { useCache: false });
  }

  /** @deprecated use GET /fe/categories/:id/products */
  @Get('slug/:slug/products')
  @ApiOperation({ summary: '[DEPRECATED] Sản phẩm theo category slug' })
  async getProductsByCategorySlug(
    @Param('slug') slug: string,
    @Query() query: ListProductDto,
  ) {
    return await this.categoryService.getProductsByCategorySlug(slug, query);
  }

  /** @deprecated use GET /fe/categories/:id */
  @Get('slug/:slug')
  @ApiOperation({ summary: '[DEPRECATED] Chi tiết category theo slug' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findBySlugFe(slug);
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed danh mục từ mock-categories.ts (Public — dev/staging)',
  })
  async seedFromMock() {
    return this.categorySeedService.seedFromMock();
  }

  @Get(':id/products')
  @ApiOperation({
    summary:
      'Sản phẩm theo category id (gồm sản phẩm ở mọi danh mục con) — Public',
  })
  async getProductsByCategoryId(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ListProductDto,
  ) {
    return await this.productService.findByCategory(id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết category theo id (Public)' })
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.findByIdFe(id);
  }
}
