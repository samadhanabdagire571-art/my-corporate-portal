import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller(['api/notifications', 'api/v1/notifications'])
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async findMine(@Query() query: any, @Request() req: any) {
    return this.notificationsService.findUserNotifications(req.user?.userId, {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 20,
      status: query.status,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user?.userId);
  }

  @Patch('read-all')
  async markAllRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user?.userId);
  }

  @Patch(':id/read')
  async markOneRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user?.userId);
  }
}
