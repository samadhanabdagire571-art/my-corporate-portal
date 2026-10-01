import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationParams } from '../../common/types';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async findUserNotifications(userId: string, params: PaginationParams = {}) {
    return this.db.findNotificationsPaginated(userId, params);
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.db.markNotificationAsRead(id, userId);
    if (!notif) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notif;
  }

  async markAllAsRead(userId: string) {
    return this.db.markAllNotificationsAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    const count = await this.db.getUnreadNotificationCount(userId);
    return { unreadCount: count };
  }
}
