import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Brand } from 'src/database/entities';
import {
  CreateBrandBulkItemDto,
  CreateBrandDto,
  UpdateBrandDto,
  ListBrandDto,
} from './dto';
import { DeletedEnum } from 'src/enums';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  private generateSlug(name: string) {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `brand-${Date.now()}`;
  }

  private generateUniqueSlug(baseSlug: string, existingSlugSet: Set<string>) {
    if (!existingSlugSet.has(baseSlug)) {
      return baseSlug;
    }

    let index = 1;
    let nextSlug = `${baseSlug}-${index}`;

    while (existingSlugSet.has(nextSlug)) {
      index += 1;
      nextSlug = `${baseSlug}-${index}`;
    }

    return nextSlug;
  }

  /**
   * @description: Danh sách thương hiệu
   */
  async findAll(query: ListBrandDto) {
    const [brands, total] = await this.brandRepo
      .fCreateFilterBuilder('brand', query)
      .select([
        'brand.id',
        'brand.name',
        'brand.slug',
        'brand.logoUrl',
        'brand.description',
        'brand.priority',
        'brand.status',
        'brand.createdAt',
      ])
      .fAndWhere('status')
      .fAndWhereLikeString('name')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE)
      .fOrderBy('priority', 'ASC')
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination()
      .getManyAndCount();

    return paginatedResponse(brands, total, query);
  }

  /**
   * @description: Lấy thương hiệu theo ID
   */
  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });

    if (!brand) {
      throw new NotFoundException(ErrorCode.BRAND_NOT_FOUND);
    }

    return brand;
  }

  /**
   * @description: Lấy thương hiệu theo slug
   */
  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
    });

    if (!brand) {
      throw new NotFoundException(ErrorCode.BRAND_NOT_FOUND);
    }

    return brand;
  }

  /**
   * @description: Tạo thương hiệu mới
   */
  async create(dto: CreateBrandDto): Promise<Brand> {
    const existsByName = await this.brandRepo.findOne({
      where: { name: dto.name },
    });
    if (existsByName) {
      throw new BadRequestException('Tên thương hiệu đã tồn tại');
    }

    const existsBySlug = await this.brandRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existsBySlug) {
      throw new BadRequestException('Slug thương hiệu đã tồn tại');
    }

    const brand = this.brandRepo.create({
      ...dto,
      priority: dto.priority ?? 0,
    });
    return await this.brandRepo.save(brand);
  }

  /**
   * @description: Tạo nhiều thương hiệu cùng lúc
   */
  async createBulks(dtos: CreateBrandBulkItemDto[]): Promise<Brand[]> {
    if (!dtos || dtos.length === 0) {
      return [];
    }

    const names = dtos.map((d) => d.name.trim());
    const inputSlugs = dtos.map((d) => (d.slug?.trim() ? d.slug.trim() : this.generateSlug(d.name)));

    const existingByName = await this.brandRepo.find({
      where: { name: In(names) },
    });
    const existingBySlug = await this.brandRepo.find({
      where: { slug: In(inputSlugs) },
    });

    const existingNameSet = new Set(existingByName.map((b) => b.name));
    const existingSlugSet = new Set(existingBySlug.map((b) => b.slug));
    const created: Brand[] = [];
    const batchNameSet = new Set<string>();

    for (const item of dtos) {
      const name = item.name.trim();
      if (existingNameSet.has(name) || batchNameSet.has(name)) {
        continue;
      }

      const preferredSlug = item.slug?.trim() || this.generateSlug(name);
      const slug = this.generateUniqueSlug(preferredSlug, existingSlugSet);

      const brand = this.brandRepo.create({
        name,
        slug,
        logoUrl: item.logoUrl,
        description: item.description,
        priority: item.priority ?? 0,
      });

      const saved = await this.brandRepo.save(brand);
      created.push(saved);
      batchNameSet.add(saved.name);
      existingNameSet.add(saved.name);
      existingSlugSet.add(saved.slug);
    }

    return created;
  }

  /**
   * Tạo brand nếu chưa có (slug hoặc name trùng thì bỏ qua).
   * Giữ nguyên slug — không thêm hậu tố -1 (dùng khi sync từ category bulk).
   */
  async createIfNotExistsExactSlug(dto: {
    name: string;
    slug: string;
    logoUrl?: string;
    description?: string;
    priority?: number;
  }): Promise<Brand | null> {
    const name = dto.name.trim();
    const slug = dto.slug.trim();
    if (!name || !slug) return null;

    const existsSlug = await this.brandRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
    });
    if (existsSlug) return null;

    const existsName = await this.brandRepo.findOne({
      where: { name, deleted: DeletedEnum.AVAILABLE },
    });
    if (existsName) return null;

    const brand = this.brandRepo.create({
      name,
      slug,
      logoUrl: dto.logoUrl,
      description: dto.description,
      priority: dto.priority ?? 0,
    });
    return await this.brandRepo.save(brand);
  }

  /**
   * Sync từ seed category: brand đã tồn tại thì gán logo nếu đang trống (mô tả chỉ trên category).
   */
  async applySeedMediaIfEmpty(
    slug: string,
    dto: { logoUrl?: string },
  ): Promise<void> {
    const s = slug.trim();
    if (!s) return;

    const brand = await this.brandRepo.findOne({
      where: { slug: s, deleted: DeletedEnum.AVAILABLE },
    });
    if (!brand) return;

    const logo = dto.logoUrl?.trim();
    if (!logo || brand.logoUrl) return;

    brand.logoUrl = logo.length > 500 ? logo.slice(0, 500) : logo;
    await this.brandRepo.save(brand);
  }

  /**
   * @description: Cập nhật thương hiệu
   */
  async update(id: number, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);

    if (dto.name && dto.name !== brand.name) {
      const existsByName = await this.brandRepo.findOne({
        where: { name: dto.name },
      });
      if (existsByName && existsByName.id !== id) {
        throw new BadRequestException('Tên thương hiệu đã tồn tại');
      }
      brand.name = dto.name;
    }

    if (dto.slug && dto.slug !== brand.slug) {
      const existsBySlug = await this.brandRepo.findOne({
        where: { slug: dto.slug },
      });
      if (existsBySlug && existsBySlug.id !== id) {
        throw new BadRequestException('Slug thương hiệu đã tồn tại');
      }
      brand.slug = dto.slug;
    }

    if (dto.logoUrl !== undefined) brand.logoUrl = dto.logoUrl;
    if (dto.description !== undefined) brand.description = dto.description;
    if (dto.priority !== undefined) brand.priority = dto.priority;
    if (dto.status !== undefined) brand.status = dto.status;

    return await this.brandRepo.save(brand);
  }

  /**
   * @description: Xóa mềm thương hiệu
   */
  async softDelete(id: number): Promise<void> {
    const brand = await this.findOne(id);
    brand.deleted = DeletedEnum.DELETED;
    await this.brandRepo.save(brand);
  }
}

