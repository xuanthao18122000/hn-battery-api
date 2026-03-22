import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  SectionDataSourceEnum,
  SectionTypeEnum,
  StatusCommonEnum,
} from '../../enums';
import { SectionItem } from './section-item.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'tinyint',
    default: SectionTypeEnum.PRODUCT,
    comment: 'Loại block: 1 = Sản phẩm, 2 = Bài viết',
  })
  type: SectionTypeEnum;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên block (vd: TOP Sản Phẩm Ắc Quy Bán Chạy)',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Code dùng cho API (vd: top-ban-chay, noi-bat)',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'home',
    comment: 'Trang hiển thị (vd: home)',
  })
  page: string;

  @Column({
    type: 'tinyint',
    default: SectionDataSourceEnum.MANUAL,
    comment: 'Nguồn dữ liệu: 1 = Chọn tay, 2 = Mới nhất',
  })
  dataSource: SectionDataSourceEnum;

  @Column({
    type: 'int',
    default: 2,
    comment: 'Số hàng sản phẩm (chỉ áp dụng khi type=PRODUCT)',
  })
  productRows: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Thứ tự block trên trang (số nhỏ hiển thị trước)',
  })
  position: number;

  @Column({
    type: 'tinyint',
    default: StatusCommonEnum.ACTIVE,
    comment: 'Trạng thái bật/tắt (StatusCommon: 1=ACTIVE, -1=INACTIVE)',
  })
  status: StatusCommonEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SectionItem, (item) => item.section)
  items: SectionItem[];

  constructor(partial: Partial<Section>) {
    Object.assign(this, partial);
  }
}
