import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators';
import { ContactInformationService } from '../contact-information.service';
import { CreateContactInformationDto } from '../dto';

@Public()
@ApiTags('Contact Informations (FE)')
@Controller('fe/contact-informations')
export class ContactInformationFeController {
  constructor(
    private readonly contactInfoService: ContactInformationService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo thông tin liên hệ/đặt hàng (public)',
    description:
      'API public cho FE (checkout, form liên hệ) gửi thông tin khách hàng mà không cần đăng nhập.',
  })
  async createPublic(
    @Body() createDto: CreateContactInformationDto,
  ) {
    return this.contactInfoService.create(createDto);
  }
}

