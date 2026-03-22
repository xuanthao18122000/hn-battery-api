import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { BrandService } from '../brand.service';
import { ListBrandDto } from '../dto';
import { StatusCommonEnum } from 'src/enums';

@Public()
@ApiTags('Brands (FE)')
@Controller('fe/brands')
export class BrandFeController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thương hiệu (public, chỉ ACTIVE)' })
  async getList(@Query() query: ListBrandDto) {
    return this.brandService.findAll({
      ...query,
      status: StatusCommonEnum.ACTIVE,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết thương hiệu theo slug (public, chỉ ACTIVE)' })
  async getBySlug(@Param('slug') slug: string) {
    const brand = await this.brandService.findBySlug(slug);
    if (brand.status !== StatusCommonEnum.ACTIVE) {
      // Ẩn brand INACTIVE với FE
      throw new Error('Không tìm thấy thương hiệu');
    }
    return brand;
  }
}

