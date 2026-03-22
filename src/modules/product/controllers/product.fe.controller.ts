import { Controller, Get, Param, Post, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { ProductService } from '../product.service';
import { ProductSeedService } from '../product.seed.service';

@Public()
@ApiTags('Products (FE)')
@Controller('fe/products')
export class ProductFeController {
  constructor(
    private readonly productService: ProductService,
    private readonly productSeedService: ProductSeedService,
  ) {}

  @Get('slug/:slug')
  @ApiOperation({
    summary:
      'Lấy chi tiết product theo slug (Public) + breadcrumb. Query fromCategory = slug danh mục user vào từ listing.',
  })
  @ApiQuery({
    name: 'fromCategory',
    required: false,
    description:
      'Slug danh mục nguồn (khi user click từ trang danh mục) để breadcrumb đúng nhánh',
  })
  async getProductBySlug(
    @Param('slug') slug: string,
    @Query('fromCategory') fromCategory?: string,
  ) {
    return await this.productService.findBySlug(slug, {
      fromCategorySlug: fromCategory,
    });
  }

  @Post('createBulks')
  @ApiOperation({ summary: 'Tạo bulk products từ mock (Public - seeding)' })
  async createBulks(
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return await this.productSeedService.createBulksFromMock(limit);
  }
}
