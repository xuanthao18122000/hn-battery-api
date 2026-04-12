import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from 'src/decorators';
import { SlugService } from 'src/modules/slug/slug.service';
import { SLUG_TYPE_ENUM } from 'src/database/entities/slug.entity';
import { Product, Category, Post } from 'src/database/entities';
import { DeletedEnum } from 'src/enums';

interface ResolveMeta {
  name: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  thumbnailUrl?: string;
}

interface ResolvePayload {
  type: number;
  entityId: number;
  slug: string;
  categoryType?: number;
  meta?: ResolveMeta;
}

@Public()
@ApiTags('Resolve')
@Controller('fe/resolve')
export class ResolveController {
  constructor(
    private readonly slugService: SlugService,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  @Get('slug/:slug')
  @ApiOperation({
    summary:
      'Resolve slug (lightweight): trả { type, entityId, slug, categoryType?, meta? }',
  })
  async resolveSlug(@Param('slug') slug: string): Promise<ResolvePayload> {
    const slugEntity = await this.slugService.findBySlug(slug).catch(() => {
      throw new NotFoundException('Không tìm thấy slug này');
    });

    if (slugEntity.entityId == null) {
      throw new NotFoundException('Slug chưa được liên kết entity');
    }

    const base: ResolvePayload = {
      type: slugEntity.type,
      entityId: slugEntity.entityId,
      slug: slugEntity.slug,
    };

    if (slugEntity.type === SLUG_TYPE_ENUM.CATEGORY) {
      const category = await this.categoryRepo.findOne({
        where: { id: slugEntity.entityId, deleted: DeletedEnum.AVAILABLE },
        select: [
          'id',
          'name',
          'type',
          'metaTitle',
          'metaDescription',
          'canonicalUrl',
          'thumbnailUrl',
        ],
      });
      if (!category) throw new NotFoundException('Không tìm thấy danh mục');
      base.categoryType = category.type;
      base.meta = {
        name: category.name,
        metaTitle: category.metaTitle ?? undefined,
        metaDescription: category.metaDescription ?? undefined,
        canonicalUrl: category.canonicalUrl ?? undefined,
        thumbnailUrl: category.thumbnailUrl ?? undefined,
      };
      return base;
    }

    if (slugEntity.type === SLUG_TYPE_ENUM.PRODUCT) {
      const product = await this.productRepo.findOne({
        where: { id: slugEntity.entityId, deleted: DeletedEnum.AVAILABLE },
        select: [
          'id',
          'name',
          'metaTitle',
          'metaDescription',
          'canonicalUrl',
          'thumbnailUrl',
        ],
      });
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
      base.meta = {
        name: product.name,
        metaTitle: product.metaTitle ?? undefined,
        metaDescription: product.metaDescription ?? undefined,
        canonicalUrl: product.canonicalUrl ?? undefined,
        thumbnailUrl: product.thumbnailUrl ?? undefined,
      };
      return base;
    }

    if (slugEntity.type === SLUG_TYPE_ENUM.POST) {
      const post = await this.postRepo.findOne({
        where: { id: slugEntity.entityId, deleted: DeletedEnum.AVAILABLE },
        select: [
          'id',
          'title',
          'metaTitle',
          'metaDescription',
          'featuredImage',
        ],
      });
      if (!post) throw new NotFoundException('Không tìm thấy bài viết');
      base.meta = {
        name: post.title,
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
        thumbnailUrl: post.featuredImage ?? undefined,
      };
      return base;
    }

    throw new NotFoundException('Không tìm thấy slug này');
  }
}
