import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductDto,
  ProductBreadcrumbDto,
} from './dto';
import { Category, Product, ProductCategory } from 'src/database/entities';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { DeletedEnum } from 'src/enums';
import { SlugService } from '../slug/slug.service';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly slugService: SlugService,
  ) {}

  /** `idPath` + `id` — leaf thuộc nhánh `ancestor` (hoặc chính ancestor). */
  private isCategoryUnder(leaf: Category, ancestor: Category): boolean {
    if (leaf.id === ancestor.id) return true;
    const prefix = `${ancestor.idPath}${ancestor.id}/`;
    return leaf.idPath.startsWith(prefix);
  }

  private parseIdPathIds(idPath: string): number[] {
    if (!idPath || idPath === '/') return [];
    return idPath
      .split('/')
      .filter(Boolean)
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n));
  }

  private pickDefaultProductCategory(
    pcs: ProductCategory[],
  ): ProductCategory | null {
    if (!pcs?.length) return null;
    const sorted = [...pcs].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
    return sorted[0];
  }

  private pickBestProductCategoryUnderFrom(
    pcs: ProductCategory[],
    fromCat: Category,
  ): ProductCategory | null {
    const under = pcs.filter(
      (pc) => pc.category && this.isCategoryUnder(pc.category, fromCat),
    );
    if (!under.length) return null;
    const maxLevel = Math.max(...under.map((pc) => pc.category!.level));
    const deepest = under.filter((pc) => pc.category!.level === maxLevel);
    deepest.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
    return deepest[0];
  }

  private async loadCategoriesByAncestorPath(leaf: Category): Promise<Category[]> {
    const pathIds = this.parseIdPathIds(leaf.idPath);
    const allIds = [...pathIds, leaf.id];
    if (allIds.length === 0) return [];
    const rows = await this.categoryRepo.find({
      where: { id: In(allIds), deleted: DeletedEnum.AVAILABLE },
    });
    const map = new Map(rows.map((c) => [c.id, c]));
    return allIds.map((id) => map.get(id)).filter(Boolean) as Category[];
  }

  private async buildProductBreadcrumb(
    product: Product,
    fromCategorySlug?: string | null,
  ): Promise<ProductBreadcrumbDto> {
    const empty: ProductBreadcrumbDto = {
      items: [],
      source: 'default',
      resolvedFromCategorySlug: null,
    };

    const pcs = product.productCategories?.filter((pc) => pc.category) ?? [];
    if (!pcs.length) return empty;

    let chosen: ProductCategory | null = null;
    let source: 'from_category' | 'default' = 'default';
    let resolvedSlug: string | null = null;

    const trimmed = fromCategorySlug?.trim();
    if (trimmed) {
      const fromRow = await this.categoryRepo.findOne({
        where: { slug: trimmed, deleted: DeletedEnum.AVAILABLE },
      });
      if (fromRow) {
        chosen = this.pickBestProductCategoryUnderFrom(pcs, fromRow);
        if (chosen) {
          source = 'from_category';
          resolvedSlug = trimmed;
        }
      }
    }

    if (!chosen) {
      chosen = this.pickDefaultProductCategory(pcs);
    }

    if (!chosen?.category) return empty;

    const chain = await this.loadCategoriesByAncestorPath(chosen.category);
    const items = chain.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));

    return {
      items,
      source,
      resolvedFromCategorySlug: source === 'from_category' ? resolvedSlug : null,
    };
  }

  private async syncProductSlugAfterCreate(slug: string) {
    const exists = await this.slugService.checkSlugExists(slug);

    if (!exists) {
      await this.slugService.create({ type: SLUG_TYPE_ENUM.PRODUCT, slug });
    }
  }

  private async syncProductSlugAfterUpdate(oldSlug: string, newSlug: string) {
    if (oldSlug === newSlug) return;

    // Update existing slug row (by old slug) if present; otherwise create it
    try {
      const existing = await this.slugService.findBySlug(oldSlug);
      await this.slugService.update(existing.id, {
        type: SLUG_TYPE_ENUM.PRODUCT,
        slug: newSlug,
      });
    } catch (err) {
      // old slug row not found => create new
      await this.slugService.create({ type: SLUG_TYPE_ENUM.PRODUCT, slug: newSlug });
    }
  }

  /**
   * @description: Danh sách sản phẩm
   */
  async findAll(query: ListProductDto) {
    const queryBuilder = this.productRepo
      .fCreateFilterBuilder('product', query)
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.sku',
        'product.shortDescription',
        'product.price',
        'product.salePrice',
        'product.stockQuantity',
        'product.thumbnailUrl',
        'product.brandId',
        'product.batteryCapacityId',
        'product.isFeatured',
        'product.isNew',
        'product.isBestSeller',
        'product.showPrice',
        'product.averageRating',
        'product.reviewCount',
        'product.soldCount',
        'product.status',
        'product.createdAt',
      ])
      .fAndWhere('status')
      .fAndWhereLikeString('name')
      .fAndWhereLikeString('sku')
      .fAndWhere('brandId')
      .fAndWhere('batteryCapacityId')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE);

    // Filter theo giá
    if (query.priceFrom) {
      queryBuilder.andWhere('product.price >= :priceFrom', {
        priceFrom: query.priceFrom,
      });
    }
    if (query.priceTo) {
      queryBuilder.andWhere('product.price <= :priceTo', {
        priceTo: query.priceTo,
      });
    }

    // Filter theo flags
    if (query.isFeatured !== undefined) {
      queryBuilder.fAndWhere('isFeatured');
    }
    if (query.isNew !== undefined) {
      queryBuilder.fAndWhere('isNew');
    }
    if (query.isBestSeller !== undefined) {
      queryBuilder.fAndWhere('isBestSeller');
    }

    // Filter theo danh mục
    if (query.categoryId) {
      queryBuilder
        .leftJoin('product.productCategories', 'pc')
        .andWhere('pc.categoryId = :categoryId', {
          categoryId: query.categoryId,
        });
    }

    queryBuilder.fOrderBy('priority', 'ASC').fOrderBy('createdAt', 'DESC');

    const [products, total] = await queryBuilder
      .fAddPagination()
      .getManyAndCount();

    return paginatedResponse(products, total, query);
  }

  /**
   * @description: Lấy sản phẩm theo ID
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
      relations: ['productCategories', 'productCategories.category'],
    });

    if (!product) {
      throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  /**
   * @description: Lấy sản phẩm theo slug + breadcrumb danh mục.
   * @param fromCategorySlug slug danh mục user vào từ listing (optional) — chọn nhánh breadcrumb.
   */
  async findBySlug(
    slug: string,
    options?: { fromCategorySlug?: string | null },
  ): Promise<Product & { breadcrumb: ProductBreadcrumbDto }> {
    const product = await this.productRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
      relations: ['productCategories', 'productCategories.category'],
    });

    if (!product) {
      throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    this.increaseViewCount(product.id);

    const breadcrumb = await this.buildProductBreadcrumb(
      product,
      options?.fromCategorySlug,
    );

    console.log('breadcrumb', breadcrumb);

    return Object.assign(product, { breadcrumb });
  }

  /**
   * @description: Tăng lượt xem sản phẩm
   */
  async increaseViewCount(productId: number): Promise<void> {
    const product = await this.findOne(productId);
    product.viewCount += 1;
    await this.productRepo.save(product);
  }
  
  /**
   * @description: Lấy sản phẩm theo SKU
   */
  async findBySku(sku: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { sku, deleted: DeletedEnum.AVAILABLE },
    });

    if (!product) {
      throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  /**
   * @description: Kiểm tra sản phẩm tồn tại
   */
  async checkProductExisted(id: number): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });

    if (!product) {
      throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    }
  }

  /**
   * @description: Tạo sản phẩm mới
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slugExistsInSlugs = await this.slugService.checkSlugExists(
      createProductDto.slug,
    );
    if (slugExistsInSlugs) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    // Kiểm tra slug đã tồn tại
    const existingSlug = await this.productRepo.findOne({
      where: { slug: createProductDto.slug },
    });
    if (existingSlug) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    // Kiểm tra SKU đã tồn tại
    const existingSku = await this.productRepo.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      throw new BadRequestException('SKU đã tồn tại');
    }

    const { categoryIds, ...productData } = createProductDto;

    // Tạo sản phẩm
    const product = this.productRepo.create(productData);
    const savedProduct = await this.productRepo.save(product);

    await this.syncProductSlugAfterCreate(savedProduct.slug);

    // Thêm vào danh mục
    if (categoryIds && categoryIds.length > 0) {
      await this.addProductToCategories(savedProduct.id, categoryIds);
    }

    return this.findOne(savedProduct.id);
  }

  /**
   * @description: Cập nhật sản phẩm
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const oldSlug = product.slug;

    if (
      updateProductDto.slug &&
      updateProductDto.slug !== product.slug
    ) {

      let excludeSlugId: number | undefined;
      try {
        const currentSlugRow = await this.slugService.findBySlug(product.slug);
        excludeSlugId = currentSlugRow.id;
      } catch (err) {
        excludeSlugId = undefined;
      }

      const existsInSlugs = await this.slugService.checkSlugExists(
        updateProductDto.slug,
        excludeSlugId,
      );
      if (existsInSlugs) {
        throw new BadRequestException('Slug đã tồn tại');
      }

      const existingSlug = await this.productRepo.findOne({
        where: { slug: updateProductDto.slug },
      });
      if (existingSlug) {
        throw new BadRequestException('Slug đã tồn tại');
      }
    }

    // Kiểm tra SKU unique
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepo.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existingSku) {
        throw new BadRequestException('SKU đã tồn tại');
      }
    }

    const { categoryIds, ...productData } = updateProductDto;

    // Cập nhật các trường
    const allowedFields: (keyof typeof productData)[] = [
      'name',
      'slug',
      'sku',
      'shortDescription',
      'description',
      'price',
      'salePrice',
      'costPrice',
      'stockQuantity',
      'unit',
      'weight',
      'length',
      'width',
      'height',
      'thumbnailUrl',
      'images',
      'brandId',
      'batteryCapacityId',
      'origin',
      'barcode',
      'priority',
      'isFeatured',
      'isNew',
      'isBestSeller',
      'showPrice',
      'attributes',
      'specifications',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
      'metaRobots',
      'canonicalUrl',
      'seoBaseSchema',
      'status',
    ];

    allowedFields.forEach((key) => {
      if (
        productData[key] !== undefined &&
        isValueDefinedAndChanged(product[key], productData[key])
      ) {
        (product as any)[key] = productData[key];
      }
    });

    await this.productRepo.save(product);

    if (updateProductDto.slug && updateProductDto.slug !== oldSlug) {
      await this.syncProductSlugAfterUpdate(oldSlug, updateProductDto.slug);
    }

    // Cập nhật danh mục nếu có
    if (categoryIds !== undefined) {
      await this.updateProductCategories(id, categoryIds);
    }

    return this.findOne(id);
  }

  /**
   * @description: Xóa mềm sản phẩm
   */
  async softDelete(id: number): Promise<void> {
    const product = await this.findOne(id);
    product.deleted = DeletedEnum.DELETED;
    await this.productRepo.save(product);
  }

  /**
   * @description: Thêm sản phẩm vào danh mục
   */
  async addProductToCategories(
    productId: number,
    categoryIds: number[],
  ): Promise<void> {
    const productCategories = categoryIds.map((categoryId, index) =>
      this.productCategoryRepo.create({
        productId,
        categoryId,
        isPrimary: index === 0, // Danh mục đầu tiên là primary
        displayOrder: index,
      }),
    );

    await this.productCategoryRepo.save(productCategories);
  }

  /**
   * @description: Cập nhật danh mục của sản phẩm
   */
  async updateProductCategories(
    productId: number,
    categoryIds: number[],
  ): Promise<void> {
    // Xóa tất cả danh mục cũ
    await this.productCategoryRepo.delete({ productId });

    // Thêm danh mục mới
    if (categoryIds.length > 0) {
      await this.addProductToCategories(productId, categoryIds);
    }
  }

  /**
   * @description: Lấy sản phẩm theo danh mục
   */
  async findByCategory(
    categoryId: number,
    query: ListProductDto,
  ): Promise<any> {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.productCategories', 'pc')
      .where('pc.categoryId = :categoryId', { categoryId })
      .andWhere('product.deleted = :deleted', {
        deleted: DeletedEnum.AVAILABLE,
      });

    if (query.batteryCapacityId != null) {
      queryBuilder.andWhere('product.batteryCapacityId = :batteryCapacityId', {
        batteryCapacityId: query.batteryCapacityId,
      });
    }

    queryBuilder.addOrderBy('product.createdAt', 'DESC');

    const [products, total] = await queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return paginatedResponse(products, total, query);
  }

  /**
   * @description: Tăng số lượng đã bán
   */
  async increaseSoldCount(productId: number, quantity: number): Promise<void> {
    const product = await this.findOne(productId);
    product.soldCount += quantity;
    product.stockQuantity -= quantity;
    await this.productRepo.save(product);
  }

  /**
   * @description: Cập nhật rating
   */
  async updateRating(
    productId: number,
    rating: number,
  ): Promise<void> {
    const product = await this.findOne(productId);
    const totalRating =
      product.averageRating * product.reviewCount + rating;
    product.reviewCount += 1;
    product.averageRating = totalRating / product.reviewCount;
    await this.productRepo.save(product);
  }

  /**
   * @description: Lấy sản phẩm liên quan
   */
  async getRelatedProducts(
    productId: number,
    limit: number = 10,
  ): Promise<Product[]> {
    const product = await this.findOne(productId);

    // Lấy danh mục của sản phẩm
    const productCategories = await this.productCategoryRepo.find({
      where: { productId },
      select: ['categoryId'],
    });

    const categoryIds = productCategories.map((pc) => pc.categoryId);

    if (categoryIds.length === 0) {
      return [];
    }

    // Lấy sản phẩm cùng danh mục
    const relatedProducts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.productCategories', 'pc')
      .where('pc.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('product.id != :productId', { productId })
      .andWhere('product.deleted = :deleted', {
        deleted: DeletedEnum.AVAILABLE,
      })
      .andWhere('product.status = :status', { status: 1 })
      .orderBy('product.soldCount', 'DESC')
      .limit(limit)
      .getMany();

    return relatedProducts;
  }
}

