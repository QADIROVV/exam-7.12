import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @ApiProperty({ example: 'IT va Dasturlash' })
  @Column()
  name: string;

  @ApiProperty({ example: 'it-va-dasturlash' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  icon: string;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => Category, (cat) => cat.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (cat) => cat.parent)
  children: Category[];
}
