import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListNotificationDto } from './dto/notification.dto';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/decorators';
import { User } from 'src/database/entities';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo' })
  getAll(@Query() query: ListNotificationDto, @CurrentUser() user: User) {
    return this.notificationService.getAll(query, user);
  }

  @Patch('read/:id')
  @ApiOperation({ summary: 'Đọc thông báo' })
  readOne(@Param('id') id: number, @CurrentUser() user: User) {
    return this.notificationService.readOne(id, user);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đọc thông báo' })
  readAll(@CurrentUser() user: User) {
    return this.notificationService.readAll(user);
  }
}
