import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @ApiProperty({ example: 'UZINFOCOM' })
  @Column()
  name: string;

  @ApiProperty({ example: 'uzinfocom' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  industry: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ nullable: true, example: '100-500' })
  @Column({ name: 'employee_count', nullable: true })
  employeeCount: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'founded_year', nullable: true })
  foundedYear: number;

  @ApiProperty({ default: false })
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
