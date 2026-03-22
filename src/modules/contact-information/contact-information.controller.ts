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
import { ContactInformationService } from './contact-information.service';
import { CreateContactInformationDto, UpdateContactInformationDto, ListContactInformationDto } from './dto';

@ApiBearerAuth()
@ApiTags('Contact Information')
@Controller('contact-informations')
export class ContactInformationController {
  constructor(private readonly contactInfoService: ContactInformationService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông tin liên hệ' })
  async findAll(@Query() query: ListContactInformationDto) {
    return this.contactInfoService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thông tin liên hệ theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.contactInfoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thông tin liên hệ mới' })
  async create(@Body() createDto: CreateContactInformationDto) {
    return await this.contactInfoService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin liên hệ' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateContactInformationDto,
  ) {
    return await this.contactInfoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông tin liên hệ' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contactInfoService.remove(id);
    return { message: 'Xóa thành công' };
  }
}
