import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Notification } from './notification.entity';
import { User } from './user.entity';

@Entity({ name: 'notification_details' })
export class NotificationDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notificationId: number;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 36,
  })
  entityRefId: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ default: false })
  seen: boolean;

  @Column({ nullable: true })
  seenAt: Date;

  @ManyToOne(() => User, (user) => user.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Notification, (notification) => notification.details, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(data: Partial<NotificationDetail>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
