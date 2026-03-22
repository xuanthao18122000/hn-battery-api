import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  DeletedEnum,
  SectionDataSourceEnum,
  SectionTypeEnum,
  StatusCommonEnum,
} from 'src/enums';
import { Post, Product, Section, SectionItem } from 'src/database/entities';
import {
  CreateSectionDto,
  UpdateSectionDto,
  AddSectionItemDto,
  UpdateSectionItemDto,
} from './dto';

const COLS_PER_ROW = 5;
const DEFAULT_POST_DISPLAY = 10;
const DEFAULT_PRODUCT_ROWS = 2;
const MIN_PRODUCT_ROWS = 1;
const MAX_PRODUCT_ROWS = 5;

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
    @InjectRepository(SectionItem)
    private readonly itemRepo: Repository<SectionItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  private getNormalizedType(type?: SectionTypeEnum): SectionTypeEnum {
    return type ?? SectionTypeEnum.PRODUCT;
  }

  private getDefaultDataSource(type: SectionTypeEnum): SectionDataSourceEnum {
    return type === SectionTypeEnum.POST
      ? SectionDataSourceEnum.LATEST
      : SectionDataSourceEnum.MANUAL;
  }

  private getNormalizedDataSource(
    type: SectionTypeEnum,
    dataSource?: SectionDataSourceEnum,
  ): SectionDataSourceEnum {
    return dataSource ?? this.getDefaultDataSource(type);
  }

  /** Số item hiển thị: block Sản phẩm = productRows * 5, block Bài viết = 10 */
  private getDisplayLimit(section: {
    type?: SectionTypeEnum;
    productRows?: number;
  }): number {
    const type = this.getNormalizedType(section.type);
    if (type === SectionTypeEnum.POST) {
      return DEFAULT_POST_DISPLAY;
    }
    const rows = this.getNormalizedProductRows(section.productRows);
    return rows * COLS_PER_ROW;
  }

  private getNormalizedProductRows(productRows?: number): number {
    const parsed = Number(productRows);
    if (!Number.isFinite(parsed) || parsed < MIN_PRODUCT_ROWS) {
      return DEFAULT_PRODUCT_ROWS;
    }
    return Math.min(Math.floor(parsed), MAX_PRODUCT_ROWS);
  }

  private async getSectionEntity(id: number) {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!section) {
      throw new NotFoundException('Không tìm thấy block');
    }
    return section;
  }

  private async assertRefExists(section: Section, refId: number) {
    if ((section.type ?? SectionTypeEnum.PRODUCT) === SectionTypeEnum.POST) {
      const post = await this.postRepo.findOne({
        where: {
          id: refId,
          status: StatusCommonEnum.ACTIVE,
          deleted: DeletedEnum.AVAILABLE,
        },
      });
      if (!post) {
        throw new BadRequestException('Bài viết không tồn tại hoặc đã bị ẩn');
      }
      return;
    }

    const product = await this.productRepo.findOne({
      where: {
        id: refId,
        status: StatusCommonEnum.ACTIVE,
        deleted: DeletedEnum.AVAILABLE,
      },
    });
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại hoặc đã bị ẩn');
    }
  }

  private async getLatestProducts(limit: number) {
    if (limit <= 0) return [];
    return this.productRepo.find({
      where: {
        status: StatusCommonEnum.ACTIVE,
        deleted: DeletedEnum.AVAILABLE,
      },
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
      take: limit,
    });
  }

  private async getLatestPosts(limit: number) {
    if (limit <= 0) return [];
    return this.postRepo.find({
      where: {
        status: StatusCommonEnum.ACTIVE,
        deleted: DeletedEnum.AVAILABLE,
      },
      order: {
        publishedAt: 'DESC',
        createdAt: 'DESC',
      },
      take: limit,
      relations: {
        category: true,
      },
    });
  }

  private async getProductMap(ids: number[]) {
    if (!ids.length) return new Map<number, Product>();
    const products = await this.productRepo.find({
      where: {
        id: In(ids),
        status: StatusCommonEnum.ACTIVE,
        deleted: DeletedEnum.AVAILABLE,
      },
    });
    return new Map(products.map((product) => [product.id, product]));
  }

  private async getPostMap(ids: number[]) {
    if (!ids.length) return new Map<number, Post>();
    const posts = await this.postRepo.find({
      where: {
        id: In(ids),
        status: StatusCommonEnum.ACTIVE,
        deleted: DeletedEnum.AVAILABLE,
      },
      relations: {
        category: true,
      },
    });
    return new Map(posts.map((post) => [post.id, post]));
  }

  private async resolveSections(sections: Section[]) {
    const normalizedSections = sections.map((section) => {
      const type = this.getNormalizedType(section.type);
      const dataSource = this.getNormalizedDataSource(type, section.dataSource);
      const productRows = this.getNormalizedProductRows(section.productRows);

      return {
        ...section,
        type,
        dataSource,
        productRows,
        items: [...(section.items || [])].sort(
          (a, b) => a.position - b.position || a.id - b.id,
        ),
      };
    });

    const manualProductIds = new Set<number>();
    const manualPostIds = new Set<number>();
    let latestProductLimit = 0;
    let latestPostLimit = 0;

    for (const section of normalizedSections) {
      if (section.dataSource === SectionDataSourceEnum.LATEST) {
        const limit = this.getDisplayLimit(section);
        if (section.type === SectionTypeEnum.POST) {
          latestPostLimit = Math.max(latestPostLimit, limit);
        } else {
          latestProductLimit = Math.max(latestProductLimit, limit);
        }
        continue;
      }

      for (const item of section.items || []) {
        if (section.type === SectionTypeEnum.POST) {
          manualPostIds.add(item.refId);
        } else {
          manualProductIds.add(item.refId);
        }
      }
    }

    const [productMap, postMap, latestProducts, latestPosts] =
      await Promise.all([
        this.getProductMap([...manualProductIds]),
        this.getPostMap([...manualPostIds]),
        this.getLatestProducts(latestProductLimit),
        this.getLatestPosts(latestPostLimit),
      ]);

    return normalizedSections.map((section) => {
      let items: Array<Record<string, unknown>> = [];

      const displayLimit = this.getDisplayLimit(section);
      if (section.dataSource === SectionDataSourceEnum.LATEST) {
        if (section.type === SectionTypeEnum.POST) {
          items = latestPosts
            .slice(0, displayLimit)
            .map((post, index) => ({
              id: index + 1,
              sectionId: section.id,
              refId: post.id,
              position: index,
              post,
            }));
        } else {
          items = latestProducts
            .slice(0, displayLimit)
            .map((product, index) => ({
              id: index + 1,
              sectionId: section.id,
              refId: product.id,
              position: index,
              product,
            }));
        }
      } else if (section.type === SectionTypeEnum.POST) {
        items = ((section.items || [])
          .map((item) => {
            const post = postMap.get(item.refId);
            if (!post) return null;
            return {
              id: item.id,
              sectionId: item.sectionId,
              refId: item.refId,
              position: item.position,
              post,
            };
          })
          .filter(Boolean) as Array<Record<string, unknown>>);
      } else {
        items = ((section.items || [])
          .map((item) => {
            const product = productMap.get(item.refId);
            if (!product) return null;
            return {
              id: item.id,
              sectionId: item.sectionId,
              refId: item.refId,
              position: item.position,
              product,
            };
          })
          .filter(Boolean) as Array<Record<string, unknown>>);
      }

      return {
        id: section.id,
        type: section.type,
        dataSource: section.dataSource,
        productRows: section.productRows,
        name: section.name,
        code: section.code,
        page: section.page,
        position: section.position,
        status: section.status,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
        items,
      };
    });
  }

  async findAll(page?: string) {
    const sections = await this.sectionRepo.find({
      where: page ? { page } : {},
      relations: { items: true },
      order: {
        position: 'ASC',
        id: 'ASC',
      },
    });
    return this.resolveSections(sections);
  }

  async findOne(id: number) {
    const section = await this.getSectionEntity(id);
    const [resolvedSection] = await this.resolveSections([section]);
    return resolvedSection;
  }

  async create(dto: CreateSectionDto) {
    const type = this.getNormalizedType(dto.type);
    const dataSource = this.getNormalizedDataSource(type, dto.dataSource);
    const section = this.sectionRepo.create({
      type,
      name: dto.name,
      code: dto.code,
      page: dto.page ?? 'home',
      dataSource,
      productRows: this.getNormalizedProductRows(dto.productRows),
      position: dto.position ?? 0,
      status: dto.status ?? StatusCommonEnum.ACTIVE,
    });
    return await this.sectionRepo.save(section);
  }

  async update(id: number, dto: UpdateSectionDto) {
    const section = await this.getSectionEntity(id);
    const nextType = this.getNormalizedType(dto.type ?? section.type);
    const nextDataSource = this.getNormalizedDataSource(
      nextType,
      dto.dataSource ?? section.dataSource,
    );

    section.type = nextType;
    if (dto.name !== undefined) section.name = dto.name;
    if (dto.code !== undefined) section.code = dto.code;
    if (dto.page !== undefined) section.page = dto.page;
    section.dataSource = nextDataSource;
    section.productRows = this.getNormalizedProductRows(
      dto.productRows ?? section.productRows,
    );
    if (dto.position !== undefined) section.position = dto.position;
    if (dto.status !== undefined) section.status = dto.status;
    return await this.sectionRepo.save(section);
  }

  async delete(id: number) {
    const section = await this.getSectionEntity(id);
    await this.itemRepo.delete({ sectionId: id });
    await this.sectionRepo.remove(section);
    return { message: 'Đã xóa block' };
  }

  async addItem(sectionId: number, dto: AddSectionItemDto) {
    const section = await this.getSectionEntity(sectionId);
    if (
      this.getNormalizedDataSource(
        this.getNormalizedType(section.type),
        section.dataSource,
      ) !== SectionDataSourceEnum.MANUAL
    ) {
      throw new BadRequestException(
        'Block đang dùng nguồn tự động, không thêm item thủ công được',
      );
    }
    await this.assertRefExists(section, dto.refId);
    const existing = await this.itemRepo.findOne({
      where: { sectionId, refId: dto.refId },
    });
    if (existing) {
      throw new BadRequestException('Item đã có trong block');
    }
    const item = this.itemRepo.create({
      sectionId,
      refId: dto.refId,
      position: dto.position ?? 0,
    });
    return await this.itemRepo.save(item);
  }

  async removeItem(sectionId: number, itemId: number) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId, sectionId },
    });
    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong block');
    }
    await this.itemRepo.remove(item);
    return { message: 'Đã xóa sản phẩm khỏi block' };
  }

  async updateItem(
    sectionId: number,
    itemId: number,
    dto: UpdateSectionItemDto,
  ) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId, sectionId },
    });
    if (!item) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong block');
    }
    if (dto.position !== undefined) item.position = dto.position;
    return await this.itemRepo.save(item);
  }

  async findSectionsByPage(page: string = 'home') {
    const sections = await this.sectionRepo.find({
      where: { page, status: StatusCommonEnum.ACTIVE },
      order: { position: 'ASC', id: 'ASC' },
      relations: { items: true },
    });
    return this.resolveSections(sections);
  }
}
