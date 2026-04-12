import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SlugService } from '../slug.service';
import { CreateSlugDto, UpdateSlugDto, ListSlugDto } from '../dto';

@ApiBearerAuth()
@ApiTags('Slugs (CMS)')
@Controller('slugs')
export class SlugCmsController {
  constructor(private readonly slugService: SlugService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách slug' })
  async findAll(@Query() query: ListSlugDto) {
    return this.slugService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết slug theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.slugService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết slug theo slug string' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.slugService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo slug mới' })
  async create(@Body() createSlugDto: CreateSlugDto) {
    return await this.slugService.create(createSlugDto);
  }

  @Post('backfill-entity-ids')
  @ApiOperation({
    summary:
      'Backfill entityId cho toàn bộ slug (match theo slug với product/category/post)',
  })
  async backfillEntityIds() {
    return await this.slugService.backfillEntityIds();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật slug' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSlugDto: UpdateSlugDto,
  ) {
    return await this.slugService.update(id, updateSlugDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa slug' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.slugService.delete(id);
    return { message: 'Xóa slug thành công' };
  }

  @Delete('slug/:slug')
  @ApiOperation({ summary: 'Xóa slug theo slug string' })
  async deleteBySlug(@Param('slug') slug: string) {
    await this.slugService.deleteBySlug(slug);
    return { message: 'Xóa slug thành công' };
  }
}
