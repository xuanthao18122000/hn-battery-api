import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Section } from './section.entity';

@Entity('section_items')
export class SectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID block',
  })
  sectionId: number;

  @Column({
    type: 'int',
    comment: 'ID item tham chiếu (product/post...)',
  })
  refId: number;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Thứ tự SP trong block (số nhỏ hiển thị trước)',
  })
  position: number;

  @ManyToOne(() => Section, (section) => section.items, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<SectionItem>) {
    Object.assign(this, partial);
  }
}
