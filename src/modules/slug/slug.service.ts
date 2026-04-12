import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSlugDto, UpdateSlugDto, ListSlugDto } from './dto';
import { Slug, Product, Category, Post } from 'src/database/entities';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';

@Injectable()
export class SlugService {
  constructor(
    @InjectRepository(Slug)
    private readonly slugRepo: Repository<Slug>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  /**
   * @description: Danh sách slug
   */
  async findAll(query: ListSlugDto) {
    const [slugs, total] = await this.slugRepo
      .fCreateFilterBuilder('slug', query)
      .select([
        'slug.id',
        'slug.type',
        'slug.slug',
        'slug.createdAt',
        'slug.updatedAt',
      ])
      .fAndWhere('type')
      .fAndWhereLikeString('slug')
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination()
      .getManyAndCount();

    return paginatedResponse(slugs, total, query);
  }

  /**
   * @description: Lấy slug theo ID
   */
  async findOne(id: number): Promise<Slug> {
    const slug = await this.slugRepo.findOne({
      where: { id },
    });

    if (!slug) {
      throw new NotFoundException(ErrorCode.SLUG_NOT_FOUND);
    }

    return slug;
  }

  /**
   * @description: Lấy slug theo slug string
   */
  async findBySlug(slugString: string): Promise<Slug> {
    const slug = await this.slugRepo.findOne({
      where: { slug: slugString },
    });

    if (!slug) {
      throw new NotFoundException(ErrorCode.SLUG_NOT_FOUND);
    }

    return slug;
  }

  /**
   * @description: Kiểm tra slug đã tồn tại chưa
   */
  async checkSlugExists(slugString: string, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.slugRepo
      .createQueryBuilder('slug')
      .where('slug.slug = :slug', { slug: slugString });

    if (excludeId) {
      queryBuilder.andWhere('slug.id != :id', { id: excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * @description: Tạo slug mới
   */
  async create(createSlugDto: CreateSlugDto): Promise<Slug> {
    // Kiểm tra slug đã tồn tại chưa
    const exists = await this.checkSlugExists(createSlugDto.slug);
    if (exists) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    const slug = this.slugRepo.create({
      type: createSlugDto.type,
      slug: createSlugDto.slug,
      entityId: createSlugDto.entityId ?? null,
    });
    return await this.slugRepo.save(slug);
  }

  /**
   * @description: Cập nhật slug
   */
  async update(id: number, updateSlugDto: UpdateSlugDto): Promise<Slug> {
    const slug = await this.findOne(id);

    // Kiểm tra slug đã tồn tại chưa (nếu có thay đổi slug)
    if (updateSlugDto.slug && updateSlugDto.slug !== slug.slug) {
      const exists = await this.checkSlugExists(updateSlugDto.slug, id);
      if (exists) {
        throw new BadRequestException('Slug đã tồn tại');
      }
      slug.slug = updateSlugDto.slug;
    }

    // Cập nhật type nếu có
    if (updateSlugDto.type !== undefined) {
      slug.type = updateSlugDto.type;
    }

    // Cập nhật entityId nếu có
    if (updateSlugDto.entityId !== undefined) {
      slug.entityId = updateSlugDto.entityId;
    }

    return await this.slugRepo.save(slug);
  }

  /**
   * @description: Backfill entityId cho toàn bộ slug table dựa trên slug string
   *   match với bảng product / category / post tương ứng với type.
   */
  async backfillEntityIds(): Promise<{
    totalScanned: number;
    productsUpdated: number;
    categoriesUpdated: number;
    postsUpdated: number;
    notMatched: { id: number; type: number; slug: string }[];
  }> {
    const slugs = await this.slugRepo.find();

    const result = {
      totalScanned: slugs.length,
      productsUpdated: 0,
      categoriesUpdated: 0,
      postsUpdated: 0,
      notMatched: [] as { id: number; type: number; slug: string }[],
    };

    for (const row of slugs) {
      let entityId: number | null = null;

      if (row.type === SLUG_TYPE_ENUM.PRODUCT) {
        const product = await this.productRepo.findOne({
          where: { slug: row.slug },
          select: ['id'],
        });
        entityId = product?.id ?? null;
      } else if (row.type === SLUG_TYPE_ENUM.CATEGORY) {
        const category = await this.categoryRepo.findOne({
          where: { slug: row.slug },
          select: ['id'],
        });
        entityId = category?.id ?? null;
      } else if (row.type === SLUG_TYPE_ENUM.POST) {
        const post = await this.postRepo.findOne({
          where: { slug: row.slug },
          select: ['id'],
        });
        entityId = post?.id ?? null;
      }

      if (entityId == null) {
        result.notMatched.push({
          id: row.id,
          type: row.type,
          slug: row.slug,
        });
        continue;
      }

      if (row.entityId !== entityId) {
        row.entityId = entityId;
        await this.slugRepo.save(row);
      }

      if (row.type === SLUG_TYPE_ENUM.PRODUCT) result.productsUpdated++;
      else if (row.type === SLUG_TYPE_ENUM.CATEGORY) result.categoriesUpdated++;
      else if (row.type === SLUG_TYPE_ENUM.POST) result.postsUpdated++;
    }

    return result;
  }

  /**
   * @description: Xóa slug
   */
  async delete(id: number): Promise<void> {
    const slug = await this.findOne(id);
    await this.slugRepo.remove(slug);
  }

  /**
   * @description: Xóa slug theo slug string
   */
  async deleteBySlug(slugString: string): Promise<void> {
    const slug = await this.findBySlug(slugString);
    await this.slugRepo.remove(slug);
  }
}
