import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, ListPostDto } from './dto';
import { CurrentUser } from 'src/decorators';
import { User } from 'src/database/entities';
import { StatusCommonEnum } from 'src/enums';

@ApiBearerAuth()
@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài viết' })
  async findAll(@Query() query: ListPostDto) {
    return this.postService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết theo slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.postService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.postService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postService.create(createPostDto, user?.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return await this.postService.update(id, updatePostDto, user?.id);
  }
}

