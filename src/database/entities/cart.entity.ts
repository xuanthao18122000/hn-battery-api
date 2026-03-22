import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

export enum CartStatusEnum {
  ACTIVE = 1,
  COMPLETED = 2,
  EXPIRED = 3,
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền',
  })
  totalAmount: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Tổng số sản phẩm',
  })
  totalItems: number;

  @Column({
    type: 'tinyint',
    default: CartStatusEnum.ACTIVE,
    comment: 'Trạng thái giỏ hàng',
  })
  status: CartStatusEnum;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Ghi chú',
  })
  note?: string;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Thời gian hết hạn giỏ hàng',
  })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
    cascade: true,
  })
  items: CartItem[];

  constructor(partial: Partial<Cart>) {
    Object.assign(this, partial);
  }
}

