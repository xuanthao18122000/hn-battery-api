import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { HomepageService } from './homepage.service';

@ApiTags('Homepage')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Lấy cấu hình homepage (Public)' })
  async getConfig() {
    return await this.homepageService.getConfig();
  }

  @ApiBearerAuth()
  @Put('config')
  @ApiOperation({ summary: 'Cập nhật cấu hình homepage (CMS)' })
  async updateConfig(@Body() config: any) {
    return await this.homepageService.updateConfig(config);
  }
}
