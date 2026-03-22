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
import { SectionService } from '../section.service';
import {
  CreateSectionDto,
  UpdateSectionDto,
  AddSectionItemDto,
  UpdateSectionItemDto,
} from '../dto';

@ApiBearerAuth()
@ApiTags('Sections (CMS)')
@Controller('sections')
export class SectionCmsController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách block (có filter page)' })
  async findAll(@Query('page') page?: string) {
    return await this.sectionService.findAll(page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết block theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo block mới' })
  async create(@Body() dto: CreateSectionDto) {
    return await this.sectionService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật block' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
  ) {
    return await this.sectionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa block' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.sectionService.delete(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Thêm sản phẩm vào block' })
  async addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddSectionItemDto,
  ) {
    return await this.sectionService.addItem(id, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi block' })
  async removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return await this.sectionService.removeItem(id, itemId);
  }

  @Put(':id/items/:itemId')
  @ApiOperation({ summary: 'Cập nhật thứ tự sản phẩm trong block' })
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateSectionItemDto,
  ) {
    return await this.sectionService.updateItem(id, itemId, dto);
  }
}
