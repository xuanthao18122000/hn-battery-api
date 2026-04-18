import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto, UpdatePostDto, ListPostDto } from './dto';
import { Post } from 'src/database/entities';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';
import { SlugService } from '../slug/slug.service';
import { isValueDefinedAndChanged, paginatedResponse } from 'src/helpers';
import { ErrorCode } from 'src/constants';
import { DeletedEnum, StatusCommonEnum } from 'src/enums';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly slugService: SlugService,
  ) {}

  private async syncPostSlugAfterCreate(slug: string, entityId: number) {
    const exists = await this.slugService.checkSlugExists(slug);
    if (!exists) {
      await this.slugService.create({
        type: SLUG_TYPE_ENUM.POST,
        slug,
        entityId,
      });
    }
  }

  private async syncPostSlugAfterUpdate(
    oldSlug: string,
    newSlug: string,
    entityId: number,
  ) {
    if (oldSlug === newSlug) return;
    try {
      const existing = await this.slugService.findBySlug(oldSlug);
      await this.slugService.update(existing.id, {
        type: SLUG_TYPE_ENUM.POST,
        slug: newSlug,
        entityId,
      });
    } catch {
      await this.slugService.create({
        type: SLUG_TYPE_ENUM.POST,
        slug: newSlug,
        entityId,
      });
    }
  }

  /**
   * @description: Danh sách bài viết
   */
  async findAll(query: ListPostDto) {
    const [posts, total] = await this.postRepo
      .fCreateFilterBuilder('post', query)
      .select([
        'post.id',
        'post.title',
        'post.slug',
        'post.shortDescription',
        'post.featuredImage',
        'post.categoryId',
        'post.views',
        'post.status',
        'post.publishedAt',
        'post.createdAt',
        'post.updatedAt',
      ])
      .fLeftJoinAndSelect('post.author', 'author', [
        'id',
        'fullName',
        'email',
        'avatar',
      ])
      .fLeftJoinAndSelect('post.category', 'category', ['id', 'name', 'slug'])
      .fAndWhere('status')
      .fAndWhere('authorId')
      .fAndWhere('categoryId')
      .fAndWhereLikeString('title')
      .fAndWhere('deleted', DeletedEnum.AVAILABLE)
      .fOrderBy('createdAt', 'DESC')
      .fAddPagination()
      .getManyAndCount()

    return paginatedResponse(posts, total, query);
  }

  /**
   * @description: Lấy bài viết theo ID
   */
  async findOne(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
      relations: ['author', 'category'],
    });

    if (!post) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }

    return post;
  }

  /**
   * @description: Lấy N bài viết mới nhất (cho block bài viết trang chủ)
   */
  async findLatest(limit: number = 4): Promise<Post[]> {
    return this.postRepo.find({
      where: { status: StatusCommonEnum.ACTIVE, deleted: DeletedEnum.AVAILABLE },
      order: { publishedAt: 'DESC', createdAt: 'DESC' },
      take: limit,
      select: [
        'id',
        'title',
        'slug',
        'shortDescription',
        'content',
        'featuredImage',
        'publishedAt',
        'createdAt',
      ],
    });
  }

  /**
   * @description: Lấy bài viết theo slug
   */
  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { slug, deleted: DeletedEnum.AVAILABLE },
      relations: ['author', 'category'],
    });

    if (!post) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }

    // Tăng lượt xem
    post.views += 1;
    await this.postRepo.save(post);

    return post;
  }

  /**
   * @description: Lấy bài viết theo id (FE, tăng views)
   */
  async findByIdFe(id: number): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
      relations: ['author', 'category'],
    });

    if (!post) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }

    post.views += 1;
    await this.postRepo.save(post);

    return post;
  }

  /**
   * @description: Tạo bài viết mới
   */
  async create(createPostDto: CreatePostDto, userId?: number): Promise<Post> {
    const existingPost = await this.postRepo.findOne({
      where: { slug: createPostDto.slug },
    });
    if (existingPost) {
      throw new BadRequestException('Slug đã tồn tại');
    }

    const newPost = this.postRepo.create({
      ...createPostDto,
      status: createPostDto.status || StatusCommonEnum.ACTIVE,
      createdBy: userId,
    });
    const saved = await this.postRepo.save(newPost);
    await this.syncPostSlugAfterCreate(saved.slug, saved.id);
    return saved;
  }

  /**
   * @description: Cập nhật bài viết
   */
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId?: number,
  ): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id, deleted: DeletedEnum.AVAILABLE },
    });
    if (!post) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }
    const oldSlug = post.slug;

    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.postRepo.findOne({
        where: { slug: updatePostDto.slug },
      });
      if (existingPost && existingPost.id !== id) {
        throw new BadRequestException('Slug đã tồn tại');
      }
    }

    if (updatePostDto.content !== undefined) post.content = updatePostDto.content;
    isValueDefinedAndChanged(post.shortDescription, updatePostDto.shortDescription) &&
      (post.shortDescription = updatePostDto.shortDescription);
    isValueDefinedAndChanged(post.title, updatePostDto.title) &&
      (post.title = updatePostDto.title);
    isValueDefinedAndChanged(post.slug, updatePostDto.slug) &&
      (post.slug = updatePostDto.slug);
    isValueDefinedAndChanged(post.featuredImage, updatePostDto.featuredImage) &&
      (post.featuredImage = updatePostDto.featuredImage);
    isValueDefinedAndChanged(post.categoryId, updatePostDto.categoryId) &&
      (post.categoryId = updatePostDto.categoryId);
    isValueDefinedAndChanged(post.status, updatePostDto.status) &&
      (post.status = updatePostDto.status);
    isValueDefinedAndChanged(post.publishedAt, updatePostDto.publishedAt) &&
      (post.publishedAt = updatePostDto.publishedAt);

    post.updatedBy = userId;
    const saved = await this.postRepo.save(post);

    if (updatePostDto.slug && updatePostDto.slug !== oldSlug) {
      await this.syncPostSlugAfterUpdate(oldSlug, updatePostDto.slug, saved.id);
    }

    return saved;
  }

  /**
   * @description: Xoá hẳn bài viết khỏi DB và dọn slug
   */
  async hardDelete(id: number): Promise<{ id: number }> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(ErrorCode.NOT_FOUND);
    }

    const slug = post.slug;
    await this.postRepo.remove(post);

    try {
      await this.slugService.deleteBySlug(slug);
    } catch {
      // slug record may not exist, ignore
    }

    return { id };
  }
}
