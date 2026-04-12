import { Controller, Get, Post as HttpPost, Param, Query, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { PostService } from '../post.service';
import { PostSeedService } from '../post.seed.service';
import { ListPostDto } from '../dto';
import { StatusCommonEnum } from 'src/enums';

@Public()
@ApiTags('Posts (FE)')
@Controller('fe/posts')
export class PostFeController {
  constructor(
    private readonly postService: PostService,
    private readonly postSeedService: PostSeedService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài viết (public, chỉ ACTIVE)' })
  async getList(@Query() query: ListPostDto) {
    return await this.postService.findAll({
      ...query,
      status: StatusCommonEnum.ACTIVE,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết theo slug (public, chỉ ACTIVE)' })
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.postService.findBySlug(slug);
    if (post.status !== StatusCommonEnum.ACTIVE) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return post;
  }

  @HttpPost('seed')
  @ApiOperation({ summary: 'Seed bài viết từ mock-posts.ts (Public — dev/staging)' })
  async seedFromMock() {
    return this.postSeedService.seedFromMock();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết theo id (public, chỉ ACTIVE)' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postService.findByIdFe(id);
    if (post.status !== StatusCommonEnum.ACTIVE) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    return post;
  }
}
