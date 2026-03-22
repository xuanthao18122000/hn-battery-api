import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationDetail } from './notification-detail.entity';

import { User } from './user.entity';
import {
  NotificationTypeReceiverEnum,
  NotificationCategoryEnum,
  NotificationRedirectTypeEnum,
} from '../../enums';

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 2000 })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ default: NotificationTypeReceiverEnum.PRIVATE })
  receiverType: number;

  @Column({ default: NotificationCategoryEnum.APPROVAL })
  category: number;

  @Column({ type: 'json' })
  receivers: number[];

  @Column({ type: 'int' })
  creatorId: number;

  @Column({
    type: 'enum',
    enum: NotificationRedirectTypeEnum,
  })
  redirectType: NotificationRedirectTypeEnum;

  @ManyToOne(() => User, (user) => user.notifications, {
    createForeignKeyConstraints: false,
  })
  creator: User[];

  @OneToMany(
    () => NotificationDetail,
    (notificationDetail) => notificationDetail.notification,
    {
      cascade: ['insert'],
    },
  )
  details: NotificationDetail[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(data: Partial<Notification>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
