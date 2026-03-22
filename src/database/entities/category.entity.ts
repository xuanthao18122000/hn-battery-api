import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryTypeEnum, DeletedEnum, StatusCommonEnum } from '../../enums';
import { ProductCategory } from './product-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID CHA',
    nullable: true,
  })
  parentId?: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên danh mục',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'địa chỉ url của cate',
  })
  slug: string;

  @Column({
    type: 'longtext',
    nullable: true,
    comment: 'content html',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: 'đường dẫn của danh mục',
    default: '',
  })
  idPath: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'độ ưu tiên hiển thị',
  })
  priority: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Vị trí sắp xếp (số nhỏ hiển thị trước)',
  })
  position: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'icon hiển thị cate',
  })
  iconUrl?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'ảnh đại diện của cate',
  })
  thumbnailUrl?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Full URL chính thức (cho duplicate content)',
  })
  canonicalUrl?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'level của cate level 0 thường sẽ là cate cha',
  })
  level: number;

  @Column({
    type: 'tinyint',
    default: CategoryTypeEnum.CATEGORY,
    comment: 'Loại: 1 = Danh mục (sản phẩm), 2 = Bài viết',
  })
  type: CategoryTypeEnum;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  metaTitle?: string;

  @Column({
    type: 'text',
    nullable: true,
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
    default: 'noindex,nofollow',
    comment: 'index,follow',
  })
  metaRobots: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Schema.org cho category',
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => ProductCategory, (productCategory) => productCategory.category)
  productCategories: ProductCategory[];

  constructor(partial: Partial<Category>) {
    Object.assign(this, partial);
  }
}

