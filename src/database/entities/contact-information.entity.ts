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
import { Customer } from './customer.entity';

export enum ContactStatusEnum {
  NEW = 'new',
  CONTACTED = 'contacted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('contact_informations')
export class ContactInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'FK tới customers.id',
  })
  customerId: number;

  @ManyToOne(() => Customer, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Tên người liên hệ',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: 'Số điện thoại',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Email',
  })
  email?: string;

  @Column({
    type: 'text',
    comment: 'Địa chỉ',
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'ID sản phẩm liên quan (nếu có)',
  })
  productId?: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: ContactStatusEnum.NEW,
    comment: 'Trạng thái: new, contacted, completed, cancelled',
  })
  status: ContactStatusEnum;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Ghi chú',
  })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<ContactInformation>) {
    Object.assign(this, partial);
  }
}
