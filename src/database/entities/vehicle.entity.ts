import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeletedEnum, StatusCommonEnum, VehicleTypeEnum } from '../../enums';
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Tên hãng xe (Honda, Mazda, Toyota, etc.)',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Đường dẫn URL của xe',
  })
  slug: string;

  @Column({
    type: 'tinyint',
    default: VehicleTypeEnum.MOTO,
    comment: 'Loại xe: 1 = Moto (xe máy), 2 = Ô tô',
  })
  type: VehicleTypeEnum;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Ảnh đại diện xe',
  })
  imageUrl?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mô tả về xe',
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

  constructor(partial: Partial<Vehicle>) {
    Object.assign(this, partial);
  }
}

