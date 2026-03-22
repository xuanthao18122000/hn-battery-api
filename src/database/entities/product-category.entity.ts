import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity('product_categories')
@Index(['productId', 'categoryId'], { unique: true })
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID sản phẩm',
  })
  productId: number;

  @Column({
    type: 'int',
    comment: 'ID danh mục',
  })
  categoryId: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Đánh dấu danh mục chính',
  })
  isPrimary: boolean;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Thứ tự hiển thị trong danh mục',
  })
  displayOrder: number;

  @ManyToOne(() => Product, (product) => product.productCategories, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Category, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<ProductCategory>) {
    Object.assign(this, partial);
  }
}

