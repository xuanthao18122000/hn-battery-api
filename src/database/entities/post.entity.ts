import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatusCommonEnum, DeletedEnum } from '../../enums';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tiêu đề bài viết',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Đường dẫn URL của bài viết',
  })
  slug: string;

  @Column({
    type: 'longtext',
    nullable: true,
    comment: 'Nội dung đầy đủ của bài viết (HTML)',
  })
  content?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả ngắn / tóm tắt bài viết',
  })
  shortDescription?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Ảnh đại diện bài viết',
  })
  featuredImage?: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID danh mục bài viết (categories.type = POST)',
  })
  categoryId?: number;

  @ManyToOne(() => Category, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Số lượt xem',
  })
  views: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID tác giả',
  })
  authorId?: number;

  @ManyToOne(() => User, { nullable: true, createForeignKeyConstraints: false })
  @JoinColumn({ name: 'authorId' })
  author?: User;

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

  @Column({
    type: 'datetime',
    nullable: true,
    comment: 'Ngày xuất bản',
  })
  publishedAt?: Date;

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

  constructor(partial: Partial<Post>) {
    Object.assign(this, partial);
  }
}

