import { UserStatusEnum } from '../../enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Notification } from './notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    length: 200,
    comment: 'Email của người dùng',
  })
  email: string;

  @Column({
    length: 200,
    comment: 'Mật khẩu của người dùng',
  })
  password: string;

  @Column({
    length: 200,
    comment: 'Họ và tên đầy đủ của người dùng',
  })
  fullName: string;

  @Column({
    length: 200,
    nullable: true,
    comment: 'Đường dẫn ảnh đại diện',
  })
  avatar: string;

  @Column({ type: 'int', nullable: true })
  roleId: number;

  @Column({
    nullable: true,
    length: 15,
    comment: 'Số điện thoại liên hệ',
  })
  phoneNumber: string;

  @Column({
    nullable: true,
    length: 500,
    comment: 'Địa chỉ người dùng',
  })
  address: string;

  @Column({
    type: 'tinyint',
    default: UserStatusEnum.ACTIVE,
    comment: 'Trạng thái',
  })
  status: UserStatusEnum;

  @Column({ type: 'datetime', nullable: true })
  lastRequireLogoutAt: Date;

  @OneToMany(() => Notification, (notification) => notification.creator)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
