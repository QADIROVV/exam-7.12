import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<Notification> {
    const notification = new this.notificationModel({ userId, type, title, message, data });
    return notification.save();
  }

  async findAllForUser(userId: string): Promise<{ data: Notification[]; unreadCount: number }> {
    const [data, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec(),
      this.notificationModel.countDocuments({ userId, isRead: false }),
    ]);
    return { data, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationModel.countDocuments({ userId, isRead: false });
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) throw new NotFoundException('Bildirishnoma topilmadi');
    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { message: 'Barchasi oqildi deb belgilandi' };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const result = await this.notificationModel.findOneAndDelete({ _id: id, userId });
    if (!result) throw new NotFoundException('Bildirishnoma topilmadi');
    return { message: 'Bildirishnoma uchirildi' };
  }
}
