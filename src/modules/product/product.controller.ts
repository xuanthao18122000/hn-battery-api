import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, ListProductDto } from './dto';

@ApiBearerAuth()
@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  async findAll(@Query() query: ListProductDto) {
    return this.productService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo slug + breadcrumb' })
  @ApiQuery({
    name: 'fromCategory',
    required: false,
    description: 'Slug danh mục nguồn (breadcrumb đúng nhánh)',
  })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('fromCategory') fromCategory?: string,
  ) {
    return await this.productService.findBySlug(slug, {
      fromCategorySlug: fromCategory,
    });
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo SKU' })
  async findBySku(@Param('sku') sku: string) {
    return await this.productService.findBySku(sku);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy sản phẩm theo danh mục' })
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query() query: ListProductDto,
  ) {
    return await this.productService.findByCategory(categoryId, query);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Lấy sản phẩm liên quan' })
  async getRelatedProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.productService.getRelatedProducts(id, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm (soft delete)' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.productService.softDelete(id);
    return { message: 'Xóa sản phẩm thành công' };
  }

  @Put(':id/categories')
  @ApiOperation({ summary: 'Cập nhật danh mục của sản phẩm' })
  async updateCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body('categoryIds') categoryIds: number[],
  ) {
    await this.productService.updateProductCategories(id, categoryIds);
    return { message: 'Cập nhật danh mục thành công' };
  }

  @Post(':id/sold')
  @ApiOperation({ summary: 'Cập nhật số lượng đã bán' })
  async increaseSoldCount(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    await this.productService.increaseSoldCount(id, quantity);
    return { message: 'Cập nhật số lượng đã bán thành công' };
  }

  @Post(':id/rating')
  @ApiOperation({ summary: 'Cập nhật rating sản phẩm' })
  async updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body('rating', ParseIntPipe) rating: number,
  ) {
    await this.productService.updateRating(id, rating);
    return { message: 'Cập nhật rating thành công' };
  }
}

