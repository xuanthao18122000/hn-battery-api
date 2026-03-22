import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { SlugService } from '../slug.service';

@Public()
@ApiTags('Slugs (FE)')
@Controller('fe/slugs')
export class SlugFeController {
  constructor(private readonly slugService: SlugService) {}

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Lấy chi tiết slug theo slug string (Public)' })
  async getSlugBySlug(@Param('slug') slug: string) {
    return await this.slugService.findBySlug(slug);
  }
}
