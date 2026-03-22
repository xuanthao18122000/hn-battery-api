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
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from '../category.service';
import { CreateCategoryDto, UpdateCategoryDto, ListCategoryDto, CreateCategoryBulkTreeDto } from '../dto';

@ApiBearerAuth()
@ApiTags('Categories (CMS)')
@Controller('categories')
export class CategoryCmsController {
  constructor(private readonly categoryService: CategoryService) {}

  private slugify(name: string) {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || `category-${Date.now()}`;
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  async findAll(@Query() query: ListCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Get('import/template')
  @ApiOperation({
    summary:
      'Tải template import danh mục (Excel). Cột code dùng để tạo cây: 1, 1.1, 1.1.1...',
  })
  async downloadImportTemplate(@Res() res: Response) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Categories');

    sheet.columns = [
      { header: 'code', key: 'code', width: 14 },
      { header: 'name', key: 'name', width: 45 },
      { header: 'slug', key: 'slug', width: 50 },
      { header: 'position', key: 'position', width: 10 },
    ];

    type Node = { name: string; children?: Node[] };
    const data: Node[] = [
      {
        name: 'Thương hiệu Ắc quy',
        children: [
          { name: 'Ắc quy GS' },
          { name: 'Ắc quy Đồng Nai' },
          { name: 'Ắc quy Delkor' },
          { name: 'Ắc quy Varta' },
          { name: 'Ắc quy Bosch' },
          { name: 'Ắc quy Colossus' },
          { name: 'Ắc quy Vision' },
          { name: 'Ắc quy Rocket' },
          { name: 'Ắc quy Toplite' },
        ],
      },
      {
        name: 'Ắc quy ô tô',
        children: [
          { name: 'Ắc quy Volvo' },
          { name: 'Ắc quy Chevrolet' },
          { name: 'Ắc quy xe Peugeot' },
          {
            name: 'Ắc quy xe BMW',
            children: [
              { name: 'Ắc quy xe BMW 3 Series' },
              { name: 'Ắc quy xe BMW 5 Series' },
              { name: 'Ắc quy xe BMW 7 Series' },
              { name: 'Ắc quy xe BMW X1' },
              { name: 'Ắc quy xe BMW X3' },
              { name: 'Ắc quy xe BMW X5' },
              { name: 'Ắc quy xe BMW X6' },
            ],
          },
          { name: 'Ắc quy xe Porsche' },
          {
            name: 'Ắc quy xe Audi',
            children: [{ name: 'Ắc quy xe Audi Q7' }],
          },
          { name: 'Ắc quy xe Isuzu' },
          {
            name: 'Ắc quy xe Mercedes',
            children: [
              { name: 'Ắc quy xe Mercedes A, CLA, GLA class' },
              { name: 'Ắc quy xe Mercedes C Class' },
              { name: 'Ắc quy xe Mercedes C200' },
              { name: 'Ắc quy xe Mercedes C250' },
              { name: 'Ắc quy xe Mercedes C300' },
              { name: 'Ắc quy xe Mercedes E200' },
              { name: 'Ắc quy xe Mercedes E250' },
              { name: 'Ắc quy xe Mercedes GLK, GLC' },
              { name: 'Ắc quy xe Mercedes ML, GL' },
              { name: 'Ắc quy xe Mercedes S Class' },
              { name: 'Ắc quy xe Mercedes V Class' },
              { name: 'Ắc quy xe Mercedes-Benz Sprinter' },
            ],
          },
          { name: 'Ắc quy Lexus' },
          {
            name: 'Ắc quy xe Mazda',
            children: [
              { name: 'Ắc quy xe Mazda 2' },
              { name: 'Ắc quy xe Mazda 3' },
              { name: 'Ắc quy xe Mazda 6' },
              { name: 'Ắc quy xe Mazda CX5' },
            ],
          },
          { name: 'Ắc quy xe Vinfast' },
          {
            name: 'Ắc quy xe Kia',
            children: [
              { name: 'Ắc quy xe Kia Cerato' },
              { name: 'Ắc quy xe Kia Soluto' },
              { name: 'Ắc quy xe Kia Morning' },
              { name: 'Ắc quy xe Kia Rondo' },
              { name: 'Ắc quy xe Kia Soul' },
              { name: 'Bình ắc quy xe KIA SEDONA' },
              { name: 'Ắc quy xe Kia Soul' },
            ],
          },
          {
            name: 'Ắc quy xe Mitsubishi',
            children: [
              { name: 'Ắc quy xe Mitsubishi Mirage' },
              { name: 'Ắc quy xe Mitsubishi Pajero sport' },
              { name: 'Ắc quy xe Mitsubishi Triton' },
              { name: 'Ắc quy xe Mitsubishi Outlander' },
              { name: 'Ắc quy xe Mitsubishi Xpander' },
            ],
          },
          {
            name: 'Ắc quy xe Toyota',
            children: [
              { name: 'Ắc quy xe Toyota Corolla Altis' },
              { name: 'Ắc quy xe Toyota Innova' },
              { name: 'Ắc quy xe Toyota Fortuner' },
              { name: 'Ắc quy xe Toyota LAND CRUISER' },
              { name: 'Ắc quy xe Toyota Land Cruiser Prado' },
              { name: 'Ắc quy xe Toyota Vios' },
              { name: 'Ắc quy xe Toyota RUSH' },
              { name: 'Ắc quy xe Toyota YARIS' },
            ],
          },
          { name: 'Ắc quy xe Ford' },
          { name: 'Ắc quy xe Huyndai' },
        ],
      },
      {
        name: 'Ắc quy mô tô',
        children: [
          { name: 'Ắc quy xe Kawasaki' },
          { name: 'Ắc quy xe moto BMW' },
          { name: 'Ắc quy xe Harley Davidson' },
          { name: 'Ắc quy xe Ducati' },
        ],
      },
      { name: 'Kinh nghiệm hay' },
    ];

    const rows: Array<{ code: string; name: string; slug: string; position: number }> = [];

    const walk = (nodes: Node[], prefix: string | null) => {
      let pos = 0;
      nodes.forEach((n, idx) => {
        pos += 1;
        const code = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
        rows.push({
          code,
          name: n.name,
          slug: this.slugify(n.name),
          position: pos,
        });
        if (n.children?.length) {
          walk(n.children, code);
        }
      });
    };

    walk(data, null);
    rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    res
      .setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      .setHeader(
        'Content-Disposition',
        'attachment; filename="category-import-template.xlsx"',
      )
      .send(Buffer.from(buffer));
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Lấy cây danh mục (CMS — luôn đọc DB, không qua cache)',
  })
  async getCategoryTree(@Query() query: ListCategoryDto) {
    return this.categoryService.getCategoryTree(query, { useCache: false });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục theo slug' })
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoryService.findBySlug(slug);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Lấy danh sách danh mục con' })
  async findChildren(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.findChildren(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Post('import')
  @ApiOperation({
    summary:
      'Import danh mục từ Excel. Mặc định type=CATEGORY, riêng "Kinh nghiệm hay" type=POST. Slug tự tạo từ name.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file?: Express.Multer.File) {
    if (!file?.buffer) {
      throw new BadRequestException('Vui lòng upload file Excel');
    }
    return this.categoryService.importFromExcelBuffer(file.buffer);
  }

  @Post('bulk/tree')
  @ApiOperation({
    summary:
      'Tạo cây danh mục từ JSON + tùy chọn sync Brand / Vehicle (cùng slug với category). Node "Kinh nghiệm hay" bị bỏ qua (không tạo, không đi children).',
  })
  async createBulkTree(@Body() dto: CreateCategoryBulkTreeDto) {
    return this.categoryService.createBulkFromTree(dto.items);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin danh mục' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục (soft delete)' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.softDelete(id);
    return { message: 'Xóa danh mục thành công' };
  }
}
