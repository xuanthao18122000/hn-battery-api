import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from '../brand.service';
import {
  CreateBrandDto,
  CreateBrandsBulkDto,
  UpdateBrandDto,
  ListBrandDto,
} from '../dto';

@ApiBearerAuth()
@ApiTags('Brands (CMS)')
@Controller('brands')
export class BrandCmsController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thương hiệu' })
  async findAll(@Query() query: ListBrandDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thương hiệu theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết thương hiệu theo slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.brandService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thương hiệu mới' })
  async create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Tạo nhiều thương hiệu cùng lúc' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'GS' },
              slug: { type: 'string', example: 'gs' },
              description: { type: 'string', example: 'Nhật Bản' },
              logoUrl: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async createBulks(@Body() dto: CreateBrandsBulkDto) {
    return this.brandService.createBulks(dto.items || []);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thương hiệu' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thương hiệu (soft delete)' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.brandService.softDelete(id);
    return { message: 'Xóa thương hiệu thành công' };
  }
}

