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
import { DeletedEnum, StatusCommonEnum } from '../../enums';
import { ProductCategory } from './product-category.entity';
import { Brand } from './brand.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên sản phẩm',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Đường dẫn URL của sản phẩm',
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'Mã SKU sản phẩm',
  })
  sku: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Mô tả ngắn',
  })
  shortDescription?: string;

  @Column({
    type: 'longtext',
    nullable: true,
    comment: 'Mô tả chi tiết (HTML)',
  })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Giá gốc',
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: 'Giá khuyến mãi',
  })
  salePrice?: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Giá vốn',
  })
  costPrice: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số lượng tồn kho',
  })
  stockQuantity: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Đơn vị tính (cái, hộp, kg...)',
  })
  unit?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Trọng lượng (kg)',
  })
  weight?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Chiều dài (cm)',
  })
  length?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Chiều rộng (cm)',
  })
  width?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: 'Chiều cao (cm)',
  })
  height?: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Ảnh đại diện chính',
  })
  thumbnailUrl?: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Danh sách ảnh sản phẩm',
  })
  images?: string[];

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID thương hiệu (brands.id)',
  })
  brandId?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment:
      'ID dung lượng ắc quy (battery_capacities.id) — filter WHERE, không cần join',
  })
  batteryCapacityId?: number;

  @ManyToOne(() => Brand, (brand) => brand.products, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Xuất xứ',
  })
  origin?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Mã vạch (Barcode)',
  })
  barcode?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Độ ưu tiên hiển thị',
  })
  priority: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Lượt xem',
  })
  viewCount: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số lượng đã bán',
  })
  soldCount: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    comment: 'Đánh giá trung bình (0-5)',
  })
  averageRating: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số lượng đánh giá',
  })
  reviewCount: number;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Sản phẩm nổi bật',
  })
  isFeatured: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Sản phẩm mới',
  })
  isNew: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Best seller',
  })
  isBestSeller: boolean;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Hiển thị giá (false = hiện Liên hệ)',
  })
  showPrice: boolean;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Thuộc tính sản phẩm (màu sắc, kích thước...)',
  })
  attributes?: object;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Thông số kỹ thuật',
  })
  specifications?: object;

  // SEO Fields
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Meta title cho SEO',
  })
  metaTitle?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Meta description cho SEO',
  })
  metaDescription?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'SEO keywords',
  })
  metaKeywords?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'index,follow',
    comment: 'Meta robots',
  })
  metaRobots: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Full URL chính thức (cho duplicate content)',
  })
  canonicalUrl?: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Schema.org cho product',
  })
  seoBaseSchema?: object;

  @Column({
    type: 'tinyint',
    default: StatusCommonEnum.ACTIVE,
    comment: 'Trạng thái bật tắt',
  })
  status: StatusCommonEnum;

  @Column({
    type: 'tinyint',
    default: DeletedEnum.AVAILABLE,
    comment: 'Trạng thái xóa',
  })
  deleted: DeletedEnum;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID người tạo',
  })
  createdBy?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID người cập nhật',
  })
  updatedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.product)
  productCategories: ProductCategory[];

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }
}

