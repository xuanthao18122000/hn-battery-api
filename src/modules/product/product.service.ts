import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import {
  CreateProductDto,
  UpdateProductDto,
  ListProductDto,
  ProductBreadcrumbDto,
} from './dto';
import { Category, Product, ProductCategory } from 'src/database/entities';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { createPerfLogger } from 'src/helpers/perf-debug';
import { ErrorCode } from 'src/constants';
import {
  CategoryTypeEnum,
  DeletedEnum,
  StatusCommonEnum,
} from 'src/enums';
import { SlugService } from '../slug/slug.service';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';
import { CDNConfig } from 'src/configs/cdn.config';

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

  private async syncProductSlugAfterCreate(slug: string, entityId: number) {
    const exists = await this.slugService.checkSlugExists(slug);

    if (!exists) {
      await this.slugService.create({
        type: SLUG_TYPE_ENUM.PRODUCT,
        slug,
        entityId,
      });
    }
  }

  /** Lưu thumbnailUrl dạng full URL (CDN_URL + path) khi client gửi path tương đối. */
  private normalizeThumbnailUrlForDb(
    url: string | undefined | null,
  ): string | undefined | null {
    if (url === undefined || url === null) return url;
    if (typeof url !== 'string') return url;
    const t = url.trim();
    if (!t) return t;
    return CDNConfig.toPublicAssetUrl(t);
  }

  private async syncProductSlugAfterUpdate(
    oldSlug: string,
    newSlug: string,
    entityId: number,
  ) {
    if (oldSlug === newSlug) return;

    // Update existing slug row (by old slug) if present; otherwise create it
    try {
      const existing = await this.slugService.findBySlug(oldSlug);
      await this.slugService.update(existing.id, {
        type: SLUG_TYPE_ENUM.PRODUCT,
        slug: newSlug,
        entityId,
      });
    } catch (err) {
      // old slug row not found => create new
      await this.slugService.create({
        type: SLUG_TYPE_ENUM.PRODUCT,
        slug: newSlug,
        entityId,
      });
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

    return this.buildProductDetail(product, options?.fromCategorySlug);
  }

  /**
   * @description: Lấy chi tiết sản phẩm theo id + breadcrumb (cho FE).
   */
  async findByIdForFe(
    id: number,
    options?: { fromCategorySlug?: string | null },
  ): Promise<Product & { breadcrumb: ProductBreadcrumbDto }> {
    const product = await this.productRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
      relations: ['productCategories', 'productCategories.category'],
    });

    if (!product) {
      throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    return this.buildProductDetail(product, options?.fromCategorySlug);
  }

  private async buildProductDetail(
    product: Product,
    fromCategorySlug?: string | null,
  ): Promise<Product & { breadcrumb: ProductBreadcrumbDto }> {
    this.increaseViewCount(product.id);

    const breadcrumb = await this.buildProductBreadcrumb(
      product,
      fromCategorySlug,
    );

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

    if (productData.thumbnailUrl !== undefined) {
      productData.thumbnailUrl = this.normalizeThumbnailUrlForDb(
        productData.thumbnailUrl,
      ) as string | undefined;
    }

    // Tạo sản phẩm
    const product = this.productRepo.create(productData);
    const savedProduct = await this.productRepo.save(product);

    await this.syncProductSlugAfterCreate(savedProduct.slug, savedProduct.id);

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

    if (productData.thumbnailUrl !== undefined) {
      productData.thumbnailUrl = this.normalizeThumbnailUrlForDb(
        productData.thumbnailUrl,
      ) as string | undefined;
    }

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
      await this.syncProductSlugAfterUpdate(
        oldSlug,
        updateProductDto.slug,
        product.id,
      );
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
   * Danh mục gốc + mọi danh mục con (theo idPath), chỉ CATEGORY sản phẩm, active.
   */
  private async getCategoryIdsIncludingDescendants(
    categoryId: number,
  ): Promise<number[]> {
    const perf = createPerfLogger(
      `ProductService.getCategoryIdsIncludingDescendants(${categoryId})`,
    );
    perf('start');

    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, deleted: DeletedEnum.AVAILABLE },
      select: ['id', 'idPath'],
    });
    perf('after findOne category');
    if (!category) return [];

    const pathPrefix = `${category.idPath}${category.id}/`;

    const rows = await this.categoryRepo
      .createQueryBuilder('c')
      .select('c.id')
      .where('c.deleted = :deleted', { deleted: DeletedEnum.AVAILABLE })
      .andWhere('c.status = :status', { status: StatusCommonEnum.ACTIVE })
      .andWhere('c.type = :catType', { catType: CategoryTypeEnum.CATEGORY })
      .andWhere(
        new Brackets((qb) => {
          qb.where('c.id = :categoryId', { categoryId }).orWhere(
            'c.idPath LIKE :pathPrefix',
            { pathPrefix: `${pathPrefix}%` },
          );
        }),
      )
      .getMany();

    perf('after descendant id query');
    return rows.map((c) => c.id);
  }

  /**
   * @description: Lấy sản phẩm theo danh mục (gồm sản phẩm gắn ở danh mục con)
   */
  async findByCategory(
    categoryId: number,
    query: ListProductDto,
  ): Promise<any> {
    const perf = createPerfLogger(
      `ProductService.findByCategory(${categoryId})`,
    );
    perf('start');

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const categoryIds = await this.getCategoryIdsIncludingDescendants(
      categoryId,
    );
    perf('after getCategoryIdsIncludingDescendants');

    if (categoryIds.length === 0) {
      perf('return empty (no category ids)');
      return paginatedResponse([], 0, query);
    }

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .distinct(true)
      .leftJoin('product.productCategories', 'pc')
      .where('pc.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('product.deleted = :deleted', {
        deleted: DeletedEnum.AVAILABLE,
      })
      .andWhere('product.status = :activeStatus', {
        activeStatus: StatusCommonEnum.ACTIVE,
      });

    if (query.batteryCapacityId != null) {
      queryBuilder.andWhere('product.batteryCapacityId = :batteryCapacityId', {
        batteryCapacityId: query.batteryCapacityId,
      });
    }

    const nameQ = query.name?.trim();
    if (nameQ) {
      queryBuilder.andWhere('LOCATE(:nameSub, LOWER(product.name)) > 0', {
        nameSub: nameQ.toLowerCase(),
      });
    }

    if (query.priceFrom != null) {
      queryBuilder.andWhere(`product.salePrice >= :priceFrom`, {
        priceFrom: query.priceFrom,
      });
    }
    if (query.priceTo != null) {
      queryBuilder.andWhere(`product.salePrice <= :priceTo`, {
        priceTo: query.priceTo,
      });
    }

    const voltageTerms = this.parseCsvTerms(query.voltageTerms);
    if (voltageTerms.length > 0) {
      queryBuilder.andWhere(
        new Brackets((sub) => {
          voltageTerms.forEach((term, i) => {
            const key = `vt${i}`;
            const clause = `LOCATE(:${key}, LOWER(product.name)) > 0`;
            if (i === 0) sub.where(clause, { [key]: term });
            else sub.orWhere(clause, { [key]: term });
          });
        }),
      );
    }

    const powerTerms = this.parseCsvTerms(query.powerTerms);
    if (powerTerms.length > 0) {
      queryBuilder.andWhere(
        new Brackets((sub) => {
          powerTerms.forEach((term, i) => {
            const key = `pt${i}`;
            const clause = `LOCATE(:${key}, LOWER(product.name)) > 0`;
            if (i === 0) sub.where(clause, { [key]: term });
            else sub.orWhere(clause, { [key]: term });
          });
        }),
      );
    }

    const sort = query.sortBy;
    if (sort === 'price-asc') {
      queryBuilder
        .orderBy('product.salePrice', 'ASC')
        .addOrderBy('product.id', 'ASC');
    } else if (sort === 'price-desc') {
      queryBuilder
        .orderBy('product.salePrice', 'DESC')
        .addOrderBy('product.id', 'DESC');
    } else if (sort === 'name-asc') {
      queryBuilder.orderBy('product.name', 'ASC');
    } else if (sort === 'name-desc') {
      queryBuilder.orderBy('product.name', 'DESC');
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    if (query.getFull !== true) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    perf('before getManyAndCount');
    const [products, total] = await queryBuilder.getManyAndCount();
    perf(`after getManyAndCount (rows=${products.length}, total=${total})`);

    return paginatedResponse(products, total, query);
  }

  private parseCsvTerms(raw?: string): string[] {
    if (!raw?.trim()) return [];
    return raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  /** Bỏ ký tự đặc biệt của LIKE (% _ \\) để tránh wildcard injection. */
  private sanitizeLikeFragment(s: string): string {
    return s.replace(/[%_\\]/g, '');
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
   * @description: Tìm kiếm sản phẩm (FE – public, lightweight).
   * Dùng LIKE: mọi từ trong query phải có trong tên (AND), tránh REGEXP OR → kết quả loãng.
   * Ưu tiên dòng có khớp cả cụm từ liên tiếp (gần đúng theo cụm, không cần regex).
   */
  async searchProducts(keyword: string, limit = 10) {
    const normalized = keyword.replace(/\s+/g, ' ').trim();
    const words = normalized
      .split(' ')
      .map((w) => this.sanitizeLikeFragment(w))
      .filter(Boolean);

    if (words.length === 0) {
      return [];
    }

    const qb = this.productRepo
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.price',
        'product.salePrice',
        'product.thumbnailUrl',
        'product.showPrice',
      ])
      .where('product.deleted = :deleted', { deleted: DeletedEnum.AVAILABLE })
      .andWhere('product.status = :status', { status: 1 });

    words.forEach((w, i) => {
      qb.andWhere(`product.name LIKE :searchWord${i}`, {
        [`searchWord${i}`]: `%${w}%`,
      });
    });

    const phraseParam = `%${words.join(' ')}%`;
    qb.orderBy(
      'CASE WHEN product.name LIKE :searchPhrase THEN 0 ELSE 1 END',
      'ASC',
    )
      .setParameter('searchPhrase', phraseParam)
      .addOrderBy('product.priority', 'ASC')
      .addOrderBy('product.soldCount', 'DESC')
      .limit(limit);

    return qb.getMany();
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

