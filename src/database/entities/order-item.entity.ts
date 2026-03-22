import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID đơn hàng',
  })
  orderId: number;

  @Column({
    type: 'int',
    comment: 'ID sản phẩm',
  })
  productId: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên sản phẩm tại thời điểm đặt hàng',
  })
  productName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Slug sản phẩm tại thời điểm đặt hàng',
  })
  productSlug?: string;

  @Column({
    type: 'int',
    default: 1,
    comment: 'Số lượng',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: 'Đơn giá tại thời điểm đặt hàng',
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Thành tiền (quantity * unitPrice)',
  })
  totalPrice: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Thuộc tính đã chọn (màu sắc, size, cấu hình...)',
  })
  selectedAttributes?: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Order, (order) => order.items, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  constructor(partial: Partial<OrderItem>) {
    Object.assign(this, partial);
  }
}

