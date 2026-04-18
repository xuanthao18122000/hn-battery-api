import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeletedEnum, StatusCommonEnum } from '../../enums';
import { Order } from './order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên khách hàng',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    comment: 'Số điện thoại (định danh khách hàng, unique)',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Email khách hàng',
  })
  email?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Địa chỉ gần nhất của khách',
  })
  address?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số đơn đã đặt',
  })
  totalOrders: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền đã chi tiêu',
  })
  totalSpent: number;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời điểm đặt đơn gần nhất',
  })
  lastOrderedAt?: Date;

  @Column({
    type: 'tinyint',
    default: StatusCommonEnum.ACTIVE,
    comment: 'Trạng thái bật/tắt',
  })
  status: StatusCommonEnum;

  @Column({
    type: 'tinyint',
    default: DeletedEnum.AVAILABLE,
    comment: 'Trạng thái xóa',
  })
  deleted: DeletedEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.customer, {
    createForeignKeyConstraints: false,
  })
  orders: Order[];

  constructor(partial: Partial<Customer>) {
    Object.assign(this, partial);
  }
}
