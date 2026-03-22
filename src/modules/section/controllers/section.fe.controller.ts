import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { SectionService } from '../section.service';

@Public()
@ApiTags('Sections (FE)')
@Controller('fe/sections')
export class SectionFeController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách block theo trang (vd: page=home)' })
  async getSectionsByPage(@Query('page') page?: string) {
    return await this.sectionService.findSectionsByPage(page || 'home');
  }
}
