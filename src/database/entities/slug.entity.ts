import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SLUG_TYPE_ENUM {
  PRODUCT = 1,
  CATEGORY = 2,
  POST = 3,
}

export type slugType = SLUG_TYPE_ENUM;

@Entity('slugs')
export class Slug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'tinyint',
    default: SLUG_TYPE_ENUM.PRODUCT,
    comment: 'Loại slug',
  })
  type: slugType;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'slug của tất cả item',
  })
  slug: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID của entity tương ứng (product/category/post)',
  })
  entityId: number | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<Slug>) {
    Object.assign(this, partial);
  }
}
