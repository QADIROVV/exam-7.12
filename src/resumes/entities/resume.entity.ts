import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../users/entities/user.entity';
import { ResumeStatus, ExperienceLevel, Currency } from '../../common/enums';

@Entity('resumes')
export class Resume extends BaseEntity {
  @ApiProperty({ example: 'Backend Developer' })
  @Column()
  title: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  summary: string;

  @ApiProperty({ enum: ResumeStatus, default: ResumeStatus.DRAFT })
  @Column({ type: 'enum', enum: ResumeStatus, default: ResumeStatus.DRAFT })
  status: ResumeStatus;

  @ApiProperty({ enum: ExperienceLevel, nullable: true })
  @Column({ type: 'enum', enum: ExperienceLevel, name: 'experience_level', nullable: true })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ nullable: true })
  @Column({ name: 'desired_salary', type: 'decimal', precision: 15, scale: 2, nullable: true })
  desiredSalary: number;

  @ApiProperty({ enum: Currency, default: Currency.UZS })
  @Column({ type: 'enum', enum: Currency, nullable: true, default: Currency.UZS })
  currency: Currency;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({ default: false })
  @Column({ name: 'is_remote_ok', default: false })
  isRemoteOk: boolean;

  @ApiProperty({ type: [String] })
  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @ApiProperty({ type: 'array', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  experience: Array<{
    company:     string;
    position:    string;
    startDate:   string;
    endDate?:    string;
    isCurrent:   boolean;
    description?: string;
  }>;

  @ApiProperty({ type: 'array', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  education: Array<{
    institution: string;
    faculty?:    string;
    degree?:     string;
    startYear:   number;
    endYear?:    number;
    isCurrent?:  boolean;
  }>;

  @ApiProperty({ type: 'array', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  languages: Array<{ name: string; level: string }>;

  @ApiProperty({ default: 0 })
  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
