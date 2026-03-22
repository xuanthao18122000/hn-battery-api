import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSlugDto, UpdateSlugDto, ListSlugDto } from './dto';
import { Slug } from 'src/database/entities';
import { paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';

@Injectable()
export class SlugService {
  constructor(
    @InjectRepository(Slug)
    private readonly slugRepo: Repository<Slug>,
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

    const slug = this.slugRepo.create(createSlugDto);
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

    return await this.slugRepo.save(slug);
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
