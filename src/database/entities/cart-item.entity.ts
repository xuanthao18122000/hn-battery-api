import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
@Index(['cartId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID giỏ hàng',
  })
  cartId: number;

  @Column({
    type: 'int',
    comment: 'ID sản phẩm',
  })
  productId: number;

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
    comment: 'Giá tại thời điểm thêm vào giỏ',
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Tổng tiền (quantity * price)',
  })
  totalPrice: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Thuộc tính đã chọn (màu sắc, size...)',
  })
  selectedAttributes?: object;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Ghi chú cho sản phẩm',
  })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.items, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  constructor(partial: Partial<CartItem>) {
    Object.assign(this, partial);
  }
}

