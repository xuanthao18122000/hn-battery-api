import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusCommonEnum } from '../../enums';

@Entity('battery_capacities')
export class BatteryCapacity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 32,
    comment: 'Hiển thị: 60Ah, 100Ah, ...',
  })
  name: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Thứ tự sắp xếp (nhỏ trước)',
  })
  position: number;

  @Column({
    type: 'tinyint',
    default: StatusCommonEnum.ACTIVE,
    comment: 'Trạng thái',
  })
  status: StatusCommonEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial?: Partial<BatteryCapacity>) {
    if (partial) Object.assign(this, partial);
  }
}
