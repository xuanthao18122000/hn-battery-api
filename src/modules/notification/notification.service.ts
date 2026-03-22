import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  CreateNotificationDto,
  ListNotificationDto,
} from './dto/notification.dto';
import { Notification, NotificationDetail, User } from 'src/database/entities';
import { paginatedResponse } from 'src/helpers';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(NotificationDetail)
    private readonly notificationDetailRepo: Repository<NotificationDetail>,
  ) {}

  async create(
    {
      title,
      body,
      entityRefId,
      category,
      redirectType,
      receiverType,
      userIds,
    }: CreateNotificationDto,
    creatorId: number, // userId
    entityManager?: EntityManager,
  ): Promise<Notification> {
    try {
      const details = userIds.map((userId) => {
        return this.notificationDetailRepo.create({
          userId,
          entityRefId,
        });
      });

      const iNotification = this.notificationRepo.create({
        title,
        body,
        category,
        redirectType,
        receiverType,
        receivers: userIds,
        creatorId,
        details,
      });

      if (entityManager) {
        return await entityManager.save(Notification, iNotification);
      }

      const notification = await this.notificationRepo.save(iNotification);

      return notification;
    } catch (error) {
      throw error;
    }
  }

  async getAll(query: ListNotificationDto, user: User) {
    const filterBuilder = this.notificationDetailRepo
      .fCreateFilterBuilder('detail', query)
      .fLeftJoinAndSelect('detail.notification', 'notification')
      .fLeftJoinAndSelect('notification.creator', 'creator')
      .fLeftJoinAndSelect('detail.user', 'user')
      .select([
        'detail',
        'notification',
        'user.id',
        'user.fullName',
        'creator.id',
        'creator.fullName',
      ])
      .where('detail.userId = :userId', {
        userId: user.id,
      })
      .fAndWhere('category', query.category, 'notification')
      .fAndWhere('seen')
      .fAndWhereLikeString('title', query.title, 'notification')
      .fAndWhereDate('createdAt', query.fromDate, query.toDate)
      .orderBy('detail.id', 'DESC')
      .fAddPagination();

    const [notifications, total] = await filterBuilder.getManyAndCount();
    return paginatedResponse(notifications, total, query);
  }

  async readOne(id: number, user: User) {
    const detail = await this.notificationDetailRepo.findOneBy({
      id,
      userId: user.id,
    });

    if (!detail) {
      throw new NotFoundException('Không tìm thấy thông báo!');
    }

    detail.seen = true;
    detail.seenAt = new Date();

    return await this.notificationDetailRepo.save(detail);
  }

  async readAll(user: User) {
    await this.notificationDetailRepo
      .createQueryBuilder()
      .update(NotificationDetail)
      .set({
        seen: true,
        seenAt: new Date(),
      })
      .where('userId = :userId AND seen = false', {
        userId: user.id,
      })
      .execute();

    return true;
  }
}
