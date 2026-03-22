import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeletedEnum, StatusCommonEnum } from '../../enums';
import { Product } from './product.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
    comment: 'Tên thương hiệu (GS, Đồng Nai, Varta, ...)',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Slug thương hiệu (gs, dong-nai, varta, ...)',
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Logo thương hiệu',
  })
  logoUrl?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả thương hiệu',
  })
  description?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Độ ưu tiên hiển thị',
  })
  priority: number;

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

  @OneToMany(() => Product, (product) => product.brand, {
    createForeignKeyConstraints: false,
  })
  products: Product[];

  constructor(partial: Partial<Brand>) {
    Object.assign(this, partial);
  }
}

