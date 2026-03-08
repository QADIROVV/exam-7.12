import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';
import { Company } from '../../companies/entities/company.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  VacancyStatus, EmploymentType, ExperienceLevel, Currency,
} from '../../common/enums';

@Entity('vacancies')
export class Vacancy extends BaseEntity {
  @ApiProperty({ example: 'Senior Backend Developer' })
  @Column()
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  requirements: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  benefits: string;

  @ApiProperty({ enum: EmploymentType })
  @Column({ type: 'enum', enum: EmploymentType, name: 'employment_type' })
  employmentType: EmploymentType;

  @ApiProperty({ enum: ExperienceLevel })
  @Column({ type: 'enum', enum: ExperienceLevel, name: 'experience_level' })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ enum: VacancyStatus, default: VacancyStatus.DRAFT })
  @Column({ type: 'enum', enum: VacancyStatus, default: VacancyStatus.DRAFT })
  status: VacancyStatus;

  @ApiProperty({ nullable: true })
  @Column({ name: 'salary_min', type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMin: number;

  @ApiProperty({ nullable: true })
  @Column({ name: 'salary_max', type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMax: number;

  @ApiProperty({ enum: Currency, default: Currency.UZS })
  @Column({ type: 'enum', enum: Currency, nullable: true, default: Currency.UZS })
  currency: Currency;

  @ApiProperty({ default: true })
  @Column({ name: 'salary_visible', default: true })
  salaryVisible: boolean;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({ default: false })
  @Column({ name: 'is_remote', default: false })
  isRemote: boolean;

  @ApiProperty({ type: [String] })
  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @ApiProperty({ default: 0 })
  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @ApiProperty({ default: 0 })
  @Column({ name: 'applications_count', default: 0 })
  applicationsCount: number;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
