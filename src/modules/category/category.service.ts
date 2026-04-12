import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  ListCategoryDto,
  CategoryBulkTreeNodeDto,
} from './dto';
import { Category } from 'src/database/entities';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { CategoryTypeEnum, DeletedEnum, StatusCommonEnum, VehicleTypeEnum } from 'src/enums';
import type { CategoryRowTaxonomy } from './category-taxonomy';
import { ProductService } from 'src/modules/product/product.service';
import { ListProductDto } from 'src/modules/product/dto';
import { SlugService } from 'src/modules/slug/slug.service';
import { BrandService } from 'src/modules/brand/brand.service';
import { VehicleService } from 'src/modules/vehicle/vehicle.service';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';
import { CacheService } from 'src/modules/cache';
import { createPerfLogger } from 'src/helpers/perf-debug';
import * as ExcelJS from 'exceljs';

const CATEGORY_TREE_CACHE_KEY_PREFIX = 'fe:categories:tree';
const CATEGORY_TREE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

function buildCategoryTreeCacheKey(query?: ListCategoryDto): string {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;
  const type = query?.type ?? '';
  const status = query?.status ?? '';
  const name = (query?.name ?? '').trim();
  return `${CATEGORY_TREE_CACHE_KEY_PREFIX}:p=${page}:l=${limit}:t=${type}:s=${status}:n=${name}`;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,

    private readonly slugService: SlugService,
    private readonly cacheService: CacheService,
    private readonly brandService: BrandService,
    private readonly vehicleService: VehicleService,
  ) {}

  private async syncCategorySlugAfterCreate(slug: string, entityId: number) {
    const exists = await this.slugService.checkSlugExists(slug);
    if (!exists) {
      await this.slugService.create({
        type: SLUG_TYPE_ENUM.CATEGORY,
        slug,
        entityId,
      });
    }
  }

  private async syncCategorySlugAfterUpdate(
    oldSlug: string,
    newSlug: string,
    entityId: number,
  ) {
    if (oldSlug === newSlug) return;

    try {
      const existing = await this.slugService.findBySlug(oldSlug);
      await this.slugService.update(existing.id, {
        type: SLUG_TYPE_ENUM.CATEGORY,
        slug: newSlug,
        entityId,
      });
    } catch (err) {
      await this.slugService.create({
        type: SLUG_TYPE_ENUM.CATEGORY,
        slug: newSlug,
        entityId,
      });
    }
  }

  private generateSlug(name: string) {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `category-${Date.now()}`;
  }

  private generateUniqueSlug(baseSlug: string, existingSlugSet: Set<string>) {
    if (!existingSlugSet.has(baseSlug)) return baseSlug;
    let index = 1;
    let nextSlug = `${baseSlug}-${index}`;
    while (existingSlugSet.has(nextSlug)) {
      index += 1;
      nextSlug = `${baseSlug}-${index}`;
    }
    return nextSlug;
  }

  private normalizeCode(codeRaw: unknown): string {
    const code = String(codeRaw ?? '').trim();
    // allow "1", "1.1", "1.1.1"
    return code.replace(/\s+/g, '');
  }

  /** Chuỗi seed không rỗng (mô tả, v.v.) */
  private normalizeOptionalSeedString(s?: string): string | undefined {
    const t = String(s ?? '').trim();
    return t.length ? t : undefined;
  }

  /** ảnh category / brand / vehicle — varchar 500 */
  private normalizeSeedMediaUrl(s?: string): string | undefined {
    const t = this.normalizeOptionalSeedString(s);
    if (!t) return undefined;
    return t.length > 500 ? t.slice(0, 500) : t;
  }

  /**
   * Tạo Brand / Vehicle cùng slug với category (giống `createBulkFromTree`: syncBrand / vehicleType).
   * Bỏ qua node gốc phân nhánh (code depth = 1: "1", "2", "3") và `post`.
   */
  private async syncBrandOrVehicleFromTaxonomy(opts: {
    code: string;
    name: string;
    slug: string;
    position?: number;
    taxonomy?: CategoryRowTaxonomy;
    image?: string;
  }): Promise<{ brandCreated: boolean; vehicleCreated: boolean }> {
    if (this.getCodeDepth(opts.code) <= 1) {
      return { brandCreated: false, vehicleCreated: false };
    }
    if (!opts.taxonomy || opts.taxonomy === 'post') {
      return { brandCreated: false, vehicleCreated: false };
    }

    const priority = opts.position ?? 0;
    const img = this.normalizeSeedMediaUrl(opts.image);

    // if (opts.taxonomy === 'brand') {
    //   const b = await this.brandService.createIfNotExistsExactSlug({
    //     name: opts.name,
    //     slug: opts.slug,
    //     priority,
    //     logoUrl: img,
    //   });
    //   if (!b && img) {
    //     await this.brandService.applySeedMediaIfEmpty(opts.slug, {
    //       logoUrl: img,
    //     });
    //   }
    //   return { brandCreated: !!b, vehicleCreated: false };
    // }
    // if (opts.taxonomy === 'vehicle_car') {
    //   const v = await this.vehicleService.createIfNotExistsExactSlug({
    //     name: opts.name,
    //     slug: opts.slug,
    //     type: VehicleTypeEnum.CAR,
    //     priority,
    //     imageUrl: img,
    //   });
    //   if (!v && img) {
    //     await this.vehicleService.applySeedMediaIfEmpty(opts.slug, {
    //       imageUrl: img,
    //     });
    //   }
    //   return { brandCreated: false, vehicleCreated: !!v };
    // }
    // if (opts.taxonomy === 'vehicle_moto') {
    //   const v = await this.vehicleService.createIfNotExistsExactSlug({
    //     name: opts.name,
    //     slug: opts.slug,
    //     type: VehicleTypeEnum.MOTO,
    //     priority,
    //     imageUrl: img,
    //   });
    //   if (!v && img) {
    //     await this.vehicleService.applySeedMediaIfEmpty(opts.slug, {
    //       imageUrl: img,
    //     });
    //   }
    //   return { brandCreated: false, vehicleCreated: !!v };
    // }
    return { brandCreated: false, vehicleCreated: false };
  }

  private getCodeDepth(code: string): number {
    return code.split('.').filter(Boolean).length;
  }

  private getParentCode(code: string): string | null {
    const parts = code.split('.').filter(Boolean);
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
  }

  private isPostCategoryName(name: string): boolean {
    const slug = this.generateSlug(name);
    return slug === 'kinh-nghiem-hay';
  }

  /**
   * Import danh mục từ mảng phẳng (code dạng 1 / 1.1 / 2.3.1 — giống cột Excel).
   * Dùng cho seed mock và có thể gọi từ CMS nếu cần.
   * `taxonomy` (optional): tạo `brands` / `vehicles` cùng slug với category (bỏ qua node gốc depth 1).
   */
  async importCategoryRows(
    rows: Array<{
      id?: number;
      code: string;
      name: string;
      slug?: string;
      position?: number;
      taxonomy?: CategoryRowTaxonomy;
      image?: string;
      description?: string;
    }>,
  ) {
    const normalized: Array<{
      id?: number;
      code: string;
      name: string;
      slug?: string;
      position?: number;
      taxonomy?: CategoryRowTaxonomy;
      image?: string;
      description?: string;
    }> = [];
    for (const r of rows) {
      const code = this.normalizeCode(r.code);
      const name = String(r.name ?? '').trim();
      if (!code || !name) continue;
      normalized.push({
        id: r.id,
        code,
        name,
        slug: r.slug,
        position: r.position,
        taxonomy: r.taxonomy,
        image: r.image,
        description: r.description,
      });
    }

    if (normalized.length === 0) {
      throw new BadRequestException('Không có dữ liệu để import');
    }

    // Sort by depth (parent first), then code
    normalized.sort((a, b) => {
      const da = this.getCodeDepth(a.code);
      const db = this.getCodeDepth(b.code);
      if (da !== db) return da - db;
      return a.code.localeCompare(b.code);
    });

    // Load existing categories (by slug) for upsert + unique slug generation
    const existingCategories = await this.categoryRepo.find({
      select: ['id', 'slug', 'type', 'deleted'],
      where: { deleted: DeletedEnum.AVAILABLE },
    });
    const slugToId = new Map(existingCategories.map((c) => [c.slug, c.id]));
    const existingSlugSet = new Set(existingCategories.map((c) => c.slug));

    const codeToId = new Map<string, number>();
    const created: number[] = [];
    const updated: number[] = [];
    const skipped: Array<{ code: string; reason: string }> = [];
    let brandsCreated = 0;
    let vehiclesCreated = 0;

    for (const r of normalized) {
      const type = this.isPostCategoryName(r.name)
        ? CategoryTypeEnum.POST
        : CategoryTypeEnum.CATEGORY;

      const parentCode = type === CategoryTypeEnum.POST ? null : this.getParentCode(r.code);
      const parentId =
        parentCode == null ? null : codeToId.get(parentCode) ?? null;

      if (parentCode && !parentId) {
        skipped.push({
          code: r.code,
          reason: `Không tìm thấy danh mục cha (${parentCode})`,
        });
        continue;
      }

      const baseSlug = r.slug ? this.generateSlug(r.slug) : this.generateSlug(r.name);
      const slug = slugToId.has(baseSlug)
        ? baseSlug
        : this.generateUniqueSlug(baseSlug, existingSlugSet);

      const existingId = slugToId.get(slug);
      if (existingId) {
        const entity = await this.categoryRepo.findOne({
          where: { id: existingId, deleted: DeletedEnum.AVAILABLE },
        });
        if (!entity) {
          skipped.push({ code: r.code, reason: 'Danh mục đã bị xóa' });
          continue;
        }

        // Update name + parent (if not POST)
        let changed = false;
        if (entity.name !== r.name) {
          entity.name = r.name;
          changed = true;
        }
        if (entity.type !== type) {
          entity.type = type;
          changed = true;
        }
        if (type === CategoryTypeEnum.POST) {
          if (entity.parentId != null) {
            entity.parentId = undefined;
            entity.level = 0;
            entity.idPath = '/';
            changed = true;
          }
        } else {
          const nextParentId = parentId ?? undefined;
          if (entity.parentId !== nextParentId) {
            const { level, idPath } = await this.calculateLevelAndPath(nextParentId);
            entity.parentId = nextParentId;
            entity.level = level;
            entity.idPath = idPath;
            changed = true;
          }
        }

        if (r.position !== undefined && entity.position !== r.position) {
          entity.position = r.position;
          changed = true;
        }

        const thumb = this.normalizeSeedMediaUrl(r.image);
        const desc = this.normalizeOptionalSeedString(r.description);
        if (thumb !== undefined && entity.thumbnailUrl !== thumb) {
          entity.thumbnailUrl = thumb;
          changed = true;
        }
        if (desc !== undefined && entity.description !== desc) {
          entity.description = desc;
          changed = true;
        }

        if (changed) {
          await this.categoryRepo.save(entity);
          updated.push(entity.id);
        }
        codeToId.set(r.code, entity.id);
        const syncUp = await this.syncBrandOrVehicleFromTaxonomy({
          code: r.code,
          name: r.name,
          slug: entity.slug,
          position: r.position,
          taxonomy: r.taxonomy,
          image: r.image,
        });
        if (syncUp.brandCreated) brandsCreated++;
        if (syncUp.vehicleCreated) vehiclesCreated++;
        continue;
      }

      // Create new
      const actualParentId = type === CategoryTypeEnum.POST ? undefined : (parentId ?? undefined);
      const { level, idPath } = await this.calculateLevelAndPath(actualParentId);
      const thumb = this.normalizeSeedMediaUrl(r.image);
      const desc = this.normalizeOptionalSeedString(r.description);
      const entity = this.categoryRepo.create({
        ...(r.id ? { id: r.id } : {}),
        name: r.name,
        slug,
        type,
        parentId: actualParentId,
        level,
        idPath,
        position: r.position ?? 0,
        thumbnailUrl: thumb,
        description: desc,
      });
      const saved = await this.categoryRepo.save(entity);
      await this.syncCategorySlugAfterCreate(saved.slug, saved.id);

      existingSlugSet.add(saved.slug);
      slugToId.set(saved.slug, saved.id);
      codeToId.set(r.code, saved.id);
      created.push(saved.id);

      const syncNew = await this.syncBrandOrVehicleFromTaxonomy({
        code: r.code,
        name: r.name,
        slug: saved.slug,
        position: r.position,
        taxonomy: r.taxonomy,
        image: r.image,
      });
      if (syncNew.brandCreated) brandsCreated++;
      if (syncNew.vehicleCreated) vehiclesCreated++;
    }

    // Invalidate tree cache for FE
    await this.cacheService.del(buildCategoryTreeCacheKey());

    return {
      totalRows: normalized.length,
      createdCount: created.length,
      updatedCount: updated.length,
      skippedCount: skipped.length,
      skipped,
      brandsCreated,
      vehiclesCreated,
    };
  }

  async importFromExcelBuffer(buffer: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      throw new BadRequestException('File Excel không hợp lệ');
    }

    // Expect headers: code, name, slug (optional), position (optional)
    const rows: Array<{
      code: string;
      name: string;
      slug?: string;
      position?: number;
    }> = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const code = this.normalizeCode(row.getCell(1).value as any);
      const name = String(row.getCell(2).value ?? '').trim();
      const slugRaw = String(row.getCell(3).value ?? '').trim();
      const positionRaw = row.getCell(4).value as any;
      const position =
        positionRaw === null || positionRaw === undefined || positionRaw === ''
          ? undefined
          : Number(positionRaw);
      if (!code || !name) return;
      rows.push({
        code,
        name,
        slug: slugRaw || undefined,
        position: Number.isFinite(position) ? position : undefined,
      });
    });

    return this.importCategoryRows(rows);
  }

  /**
   * Import cây danh mục từ JSON (name/slug/children).
   * - Bỏ qua hoàn toàn node trùng slug `kinh-nghiem-hay` (không tạo category, không duyệt children).
   * - `syncBrand` / `vehicleType`: tạo Brand hoặc Vehicle dùng chung slug với category vừa tạo/cập nhật.
   */
  async createBulkFromTree(nodes: CategoryBulkTreeNodeDto[]) {
    const existingCategories = await this.categoryRepo.find({
      select: ['id', 'slug', 'type', 'deleted', 'parentId', 'name', 'position'],
      where: { deleted: DeletedEnum.AVAILABLE },
    });
    const slugToId = new Map(existingCategories.map((c) => [c.slug, c.id]));
    const existingSlugSet = new Set(existingCategories.map((c) => c.slug));

    const stats = {
      categoriesCreated: 0,
      categoriesUpdated: 0,
      brandsCreated: 0,
      vehiclesCreated: 0,
      skippedNodes: [] as Array<{ slug: string; reason: string }>,
    };

    const walk = async (list: CategoryBulkTreeNodeDto[], parentId: number | null) => {
      for (let i = 0; i < list.length; i++) {
        const node = list[i];
        const baseSlug = node.slug ? this.generateSlug(node.slug) : this.generateSlug(node.name);

        if (baseSlug === 'kinh-nghiem-hay' || this.isPostCategoryName(node.name)) {
          stats.skippedNodes.push({
            slug: baseSlug,
            reason: 'Bỏ qua: Kinh nghiệm hay (không tạo category/children)',
          });
          continue;
        }

        const slug = slugToId.has(baseSlug)
          ? baseSlug
          : this.generateUniqueSlug(baseSlug, existingSlugSet);

        const existingId = slugToId.get(slug);
        const rName = node.name.trim();

        let entityId: number;
        let finalSlug: string;

        if (existingId) {
          const entity = await this.categoryRepo.findOne({
            where: { id: existingId, deleted: DeletedEnum.AVAILABLE },
          });
          if (!entity) {
            stats.skippedNodes.push({ slug, reason: 'Danh mục đã bị xóa (theo slug map)' });
            continue;
          }

          let changed = false;
          if (entity.name !== rName) {
            entity.name = rName;
            changed = true;
          }
          if (entity.type !== CategoryTypeEnum.CATEGORY) {
            entity.type = CategoryTypeEnum.CATEGORY;
            changed = true;
          }
          const nextParentId = parentId ?? undefined;
          if (entity.parentId !== nextParentId) {
            const { level, idPath } = await this.calculateLevelAndPath(nextParentId);
            entity.parentId = nextParentId;
            entity.level = level;
            entity.idPath = idPath;
            changed = true;
          }
          if (entity.position !== i) {
            entity.position = i;
            changed = true;
          }

          if (changed) {
            await this.categoryRepo.save(entity);
            stats.categoriesUpdated++;
          }
          entityId = entity.id;
          finalSlug = entity.slug;
        } else {
          const actualParentId = parentId ?? undefined;
          const { level, idPath } = await this.calculateLevelAndPath(actualParentId);
          const entity = this.categoryRepo.create({
            name: rName,
            slug,
            type: CategoryTypeEnum.CATEGORY,
            parentId: actualParentId,
            level,
            idPath,
            position: i,
          });
          const saved = await this.categoryRepo.save(entity);
          await this.syncCategorySlugAfterCreate(saved.slug, saved.id);

          existingSlugSet.add(saved.slug);
          slugToId.set(saved.slug, saved.id);
          entityId = saved.id;
          finalSlug = saved.slug;
          stats.categoriesCreated++;
        }

        if (node.syncBrand) {
          const b = await this.brandService.createIfNotExistsExactSlug({
            name: rName,
            slug: finalSlug,
            logoUrl: node.logoUrl,
            priority: node.priority ?? i,
          });
          if (b) stats.brandsCreated++;
        }
        if (node.vehicleType != null) {
          const v = await this.vehicleService.createIfNotExistsExactSlug({
            name: rName,
            slug: finalSlug,
            type: node.vehicleType,
            imageUrl: node.imageUrl,
            priority: node.priority ?? i,
          });
          if (v) stats.vehiclesCreated++;
        }

        if (node.children?.length) {
          await walk(node.children, entityId);
        }
      }
    };

    await walk(nodes, null);

    await this.cacheService.del(buildCategoryTreeCacheKey());

    return {
      ...stats,
      skippedCount: stats.skippedNodes.length,
    };
  }

  /**
   * @description: Danh sách danh mục
   */
  async findAll(query: ListCategoryDto) {
    const qb = this.categoryRepo
      .fCreateFilterBuilder('category', query)
      .select([
        'category.id',
        'category.parentId',
        'category.name',
        'category.slug',
        'category.description',
        'category.idPath',
        'category.priority',
        'category.position',
        'category.iconUrl',
        'category.thumbnailUrl',
        'category.level',
        'category.status',
        'category.type',
        'category.createdAt',
      ])
      .fAndWhere('type')
      .fAndWhere('status')
      .fAndWhere('parentId')
      .fAndWhere('level')
      .fAndWhereLikeString('name')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE)
      .fOrderBy('position', 'ASC')
      .fOrderBy('priority', 'ASC')
      .fOrderBy('createdAt', 'DESC');

    // Danh mục bài viết (type=POST) không có cấp con — chỉ lấy danh mục gốc
    if (query.type === CategoryTypeEnum.POST) {
      qb.andWhere('category.parentId IS NULL');
    }

    const [categories, total] = await qb.fAddPagination().getManyAndCount();

    // Nếu không có dữ liệu, trả về luôn
    if (categories.length === 0) {
      return paginatedResponse([], total, query);
    }

    // Lấy full descendants cho các category trong page (mọi cấp) dựa vào idPath prefix
    const prefixes = categories.map((c) => `${c.idPath}${c.id}/`);
    const ids = categories.map((c) => c.id);

    const all = await this.categoryRepo
      .createQueryBuilder('category')
      .select([
        'category.id',
        'category.parentId',
        'category.name',
        'category.slug',
        'category.description',
        'category.idPath',
        'category.priority',
        'category.position',
        'category.iconUrl',
        'category.thumbnailUrl',
        'category.level',
        'category.status',
        'category.type',
        'category.createdAt',
      ])
      .where('category.deleted = :deleted', { deleted: DeletedEnum.AVAILABLE })
      .andWhere(
        new Brackets((w) => {
          w.where('category.id IN (:...ids)', { ids });
          prefixes.forEach((p, idx) => {
            w.orWhere(`category.idPath LIKE :p${idx}`, { [`p${idx}`]: `${p}%` });
          });
        }),
      )
      .orderBy('category.position', 'ASC')
      .addOrderBy('category.priority', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .getMany();

    // Build tree đệ quy từ danh sách all (giữ nguyên thứ tự children theo position/priority)
    const byParent = new Map<number | null, Category[]>();
    for (const c of all) {
      const key = (c.parentId ?? null) as number | null;
      const arr = byParent.get(key) ?? [];
      arr.push(c);
      byParent.set(key, arr);
    }

    const attach = (node: Category): Category => {
      const children = byParent.get(node.id) ?? [];
      return { ...node, children: children.map(attach) };
    };

    const roots = categories.map((c) => attach(c));

    return paginatedResponse(roots, total, query);
  }

  /**
   * @description: Danh sách danh mục dạng tree (có filter và pagination)
   */
  async findListTree(query: ListCategoryDto) {
    const queryBuilder = this.categoryRepo
      .fCreateFilterBuilder('category', query)
      .select([
        'category.id',
        'category.parentId',
        'category.name',
        'category.slug',
        'category.description',
        'category.idPath',
        'category.priority',
        'category.position',
        'category.iconUrl',
        'category.thumbnailUrl',
        'category.level',
        'category.status',
        'category.type',
        'category.createdAt',
      ])
      .fAndWhere('type')
      .fAndWhere('status')
      .fAndWhere('parentId')
      .fAndWhere('level')
      .fAndWhereLikeString('name')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE)
      .fOrderBy('position', 'ASC')
      .fOrderBy('priority', 'ASC')
      .fOrderBy('createdAt', 'ASC');

    if (query.type === CategoryTypeEnum.POST) {
      queryBuilder.andWhere('category.parentId IS NULL');
    }

    const allCategories = await queryBuilder.getMany();

    // Build tree structure
    const buildTree = (parentId: number | null = null): Category[] => {
      return allCategories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    const treeCategories = buildTree(null);

    const total = treeCategories.length;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTree = treeCategories.slice(startIndex, endIndex);

    return paginatedResponse(paginatedTree, total, query);
  }

  /**
   * @description: Lấy danh mục theo ID
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    }

    return category;
  }

  /**
   * @description: Lấy danh mục theo slug
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    }

    return category;
  }

  /**
   * FE: chi tiết danh mục + children/siblings.
   * Không dùng relations `children`/`parent` (tránh load longtext description của hàng loạt con → chậm >1s).
   */
  async findBySlugFe(slug: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
    });
    if (!category) {
      throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    }
    return this.attachFeChildren(category);
  }

  /**
   * FE: chi tiết danh mục theo ID + children/siblings.
   */
  async findByIdFe(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });
    if (!category) {
      throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    }
    return this.attachFeChildren(category);
  }

  private async attachFeChildren(category: Category): Promise<Category> {
    const childColumns: (keyof Category)[] = [
      'id',
      'name',
      'slug',
      'thumbnailUrl',
      'iconUrl',
      'position',
      'priority',
      'parentId',
      'level',
      'type',
    ];

    const listActiveByParent = (parentId: number) =>
      this.categoryRepo.find({
        where: {
          parentId,
          deleted: DeletedEnum.AVAILABLE,
          status: StatusCommonEnum.ACTIVE,
        },
        select: childColumns as never,
        order: { position: 'ASC', priority: 'ASC' },
      });

    const activeChildren = await listActiveByParent(category.id);
    if (activeChildren.length > 0) {
      category.children = activeChildren;
      return category;
    }

    if (!category.parentId) {
      category.children = [];
      return category;
    }

    const siblings = (await listActiveByParent(category.parentId)).filter(
      (c) => c.id !== category.id,
    );
    category.children = siblings;
    return category;
  }

  /**
   * @description: Kiểm tra danh mục tồn tại
   */
  async checkCategoryExisted(id: number): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });

    if (!category) {
      throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    }
  }

  /**
   * @description: Tính toán level và idPath cho danh mục
   */
  private async calculateLevelAndPath(
    parentId?: number | null,
  ): Promise<{ level: number; idPath: string }> {
    if (!parentId) {
      return { level: 0, idPath: '/' };
    }

    const parent = await this.findOne(parentId);
    return {
      level: parent.level + 1,
      idPath: `${parent.idPath}${parent.id}/`,
    };
  }

  /**
   * @description: Tạo danh mục mới
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Kiểm tra slug đã tồn tại (global, slugs table)
    const slugExistsInSlugs = await this.slugService.checkSlugExists(
      createCategoryDto.slug,
    );
    if (slugExistsInSlugs) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await this.categoryRepo.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    // Danh mục bài viết (type=POST) không có danh mục cha
    const type = createCategoryDto.type ?? CategoryTypeEnum.CATEGORY;
    const parentId =
      type === CategoryTypeEnum.POST ? null : createCategoryDto.parentId;

    if (parentId) {
      await this.checkCategoryExisted(parentId);
    }

    const { level, idPath } = await this.calculateLevelAndPath(parentId ?? undefined);

    const category = this.categoryRepo.create({
      ...createCategoryDto,
      type,
      parentId: parentId ?? undefined,
      level,
      idPath,
    });

    const saved = await this.categoryRepo.save(category);

    // Insert slug row (type CATEGORY)
    await this.syncCategorySlugAfterCreate(saved.slug, saved.id);

    return saved;
  }

  /**
   * @description: Cập nhật thông tin danh mục
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    const oldSlug = category.slug;

    // Kiểm tra slug đã tồn tại chưa (nếu có thay đổi slug)
    if (
      updateCategoryDto.slug &&
      updateCategoryDto.slug !== category.slug
    ) {
      // Ensure unique in `slugs` table (exclude current slug row if present)
      let excludeSlugId: number | undefined;
      try {
        const currentSlugRow = await this.slugService.findBySlug(category.slug);
        excludeSlugId = currentSlugRow.id;
      } catch (err) {
        excludeSlugId = undefined;
      }

      const existsInSlugs = await this.slugService.checkSlugExists(
        updateCategoryDto.slug,
        excludeSlugId,
      );
      if (existsInSlugs) {
        throw new BadRequestException('Slug đã tồn tại');
      }

      const existingCategory = await this.categoryRepo.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new BadRequestException('Slug đã tồn tại');
      }
    }

    // Danh mục bài viết (type=POST) không có danh mục cha — bỏ qua thay đổi parentId
    const isPostCategory = category.type === CategoryTypeEnum.POST;
    if (
      !isPostCategory &&
      isValueDefinedAndChanged(category.parentId, updateCategoryDto.parentId)
    ) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException(
          'Không thể đặt danh mục cha là chính nó',
        );
      }

      if (updateCategoryDto.parentId) {
        await this.checkCategoryExisted(updateCategoryDto.parentId);
      }

      const { level, idPath } = await this.calculateLevelAndPath(
        updateCategoryDto.parentId,
      );
      category.level = level;
      category.idPath = idPath;
      category.parentId = updateCategoryDto.parentId;
    }

    // Cập nhật các trường khác
    const allowedFields: (keyof UpdateCategoryDto)[] = [
      'name',
      'slug',
      'description',
      'priority',
      'position',
      'iconUrl',
      'thumbnailUrl',
      'canonicalUrl',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
      'metaRobots',
      'seoBaseSchema',
      'status',
    ];

    allowedFields.forEach((key) => {
      if (
        updateCategoryDto[key] !== undefined &&
        isValueDefinedAndChanged(category[key], updateCategoryDto[key])
      ) {
        (category as any)[key] = updateCategoryDto[key];
      }
    });

    const saved = await this.categoryRepo.save(category);

    // Sync slug table if slug changed
    if (updateCategoryDto.slug && updateCategoryDto.slug !== oldSlug) {
      await this.syncCategorySlugAfterUpdate(
        oldSlug,
        updateCategoryDto.slug,
        saved.id,
      );
    }

    return saved;
  }

  /**
   * @description: Xóa mềm danh mục
   */
  async softDelete(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Kiểm tra xem danh mục có con không
    const childrenCount = await this.categoryRepo.count({
      where: { parentId: id, deleted: DeletedEnum.AVAILABLE },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Không thể xóa danh mục có danh mục con',
      );
    }

    category.deleted = DeletedEnum.DELETED;
    await this.categoryRepo.save(category);
  }

  /**
   * @description: Lấy tất cả danh mục con theo ID cha
   */
  async findChildren(parentId: number): Promise<Category[]> {
    return await this.categoryRepo.find({
      where: { parentId, deleted: DeletedEnum.AVAILABLE },
      order: { position: 'ASC', priority: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * @description: Lấy cây danh mục (dạng tree) — FE dùng Redis cache; CMS truyền `{ useCache: false }`.
   */
  async getCategoryTree(
    query?: ListCategoryDto,
    options?: { useCache?: boolean },
  ): Promise<Category[] | any> {
    const useCache = options?.useCache ?? true;

    if (!useCache) {
      return this.getCategoryTreeFromDb(query);
    }

    const key = buildCategoryTreeCacheKey(query);
    return this.cacheService.getOrSet(
      key,
      () => this.getCategoryTreeFromDb(query),
      CATEGORY_TREE_CACHE_TTL_MS,
    );
  }

  /**
   * @description: Lấy cây danh mục từ DB (dùng nội bộ / cache miss)
   */
  private async getCategoryTreeFromDb(query?: ListCategoryDto): Promise<Category[] | any> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    // Lấy root categories (cấp 1) với pagination, sắp xếp theo position
    const rootQueryBuilder = this.categoryRepo
      .createQueryBuilder('category')
      .where('category.parentId IS NULL')
      .andWhere('category.deleted = :deleted', { deleted: DeletedEnum.AVAILABLE })
      .andWhere('category.status = :status', { status: StatusCommonEnum.ACTIVE })
      .orderBy('category.priority', 'ASC')
      .addOrderBy('category.position', 'ASC');
    // Apply filters nếu có
    if (query?.status !== undefined) {
      rootQueryBuilder.andWhere('category.status = :status', { status: query.status });
    }
    if (query?.type !== undefined) {
      rootQueryBuilder.andWhere('category.type = :type', { type: query.type });
    }
    if (query?.name) {
      rootQueryBuilder.andWhere('category.name LIKE :name', { name: `%${query.name}%` });
    }

    // Pagination cho root categories
    const [rootCategories, total] = await rootQueryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Lấy full descendants cho root categories (mọi cấp) dựa vào idPath prefix
    const prefixes = rootCategories.map((c) => `${c.idPath}${c.id}/`);
    const rootIds = rootCategories.map((c) => c.id);

    let all: Category[] = [];
    if (rootIds.length > 0) {
      const qb = this.categoryRepo
        .createQueryBuilder('category')
        .where('category.deleted = :deleted', { deleted: DeletedEnum.AVAILABLE })
        .andWhere('category.status = :status', { status: StatusCommonEnum.ACTIVE })
        .andWhere(
          new Brackets((w) => {
            w.where('category.id IN (:...rootIds)', { rootIds });
            prefixes.forEach((p, idx) => {
              w.orWhere(`category.idPath LIKE :p${idx}`, { [`p${idx}`]: `${p}%` });
            });
          }),
        )
        .orderBy('category.priority', 'ASC')
        .addOrderBy('category.position', 'ASC')
        .addOrderBy('category.createdAt', 'DESC');

      // Apply type filter consistently
      if (query?.type !== undefined) {
        qb.andWhere('category.type = :type', { type: query.type });
      }

      all = await qb.getMany();
    }

    const byParent = new Map<number | null, Category[]>();
    for (const c of all) {
      const key = (c.parentId ?? null) as number | null;
      const arr = byParent.get(key) ?? [];
      arr.push(c);
      byParent.set(key, arr);
    }

    const attach = (node: Category): Category => {
      const children = byParent.get(node.id) ?? [];
      return { ...node, children: children.map(attach) };
    };

    const tree = rootCategories.map((c) => attach(c));

    // Nếu có query (pagination), trả về paginated response
    if (query) {
      return paginatedResponse(tree, total, query);
    }

    // Nếu không có query, trả về toàn bộ tree
    return tree;
  }

  /**
   * @description: Lấy danh sách sản phẩm theo category slug (Public)
   */
  async getProductsByCategorySlug(slug: string, query: ListProductDto) {
    const perf = createPerfLogger(
      `CategoryService.getProductsByCategorySlug(${slug})`,
    );
    perf('start');

    const category = await this.categoryRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
      select: ['id'],
    });
    perf('after findOne category id');

    if (!category) {
      throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
    }
    const out = await this.productService.findByCategory(category.id, query);
    perf('after productService.findByCategory');
    return out;
  }
}

