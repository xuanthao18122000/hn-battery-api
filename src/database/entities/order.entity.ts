import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatusEnum {
  NEW = 1,
  CONFIRMED = 2,
  SHIPPING = 3,
  COMPLETED = 4,
  CANCELLED = 5,
}

export enum PaymentMethodEnum {
  COD = 1,
  BANK_TRANSFER = 2,
  OTHER = 3,
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên khách hàng',
  })
  customerName: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Số điện thoại',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Email',
  })
  email: string;

  @Column({
    type: 'text',
    comment: 'Địa chỉ giao hàng',
  })
  shippingAddress: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Ghi chú của khách hàng',
  })
  note?: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền đơn hàng',
  })
  totalAmount: number;

  @Column({
    type: 'tinyint',
    default: OrderStatusEnum.NEW,
    comment: 'Trạng thái đơn hàng: 1=new,2=confirmed,3=shipping,4=completed,5=cancelled',
  })
  status: OrderStatusEnum;

  @Column({
    type: 'tinyint',
    default: PaymentMethodEnum.COD,
    comment: 'Phương thức thanh toán: 1=COD,2=chuyển khoản,3=khác',
  })
  paymentMethod: PaymentMethodEnum;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời gian xác nhận đơn',
  })
  confirmedAt?: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời gian hoàn tất đơn',
  })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}

