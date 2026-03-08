import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../users/entities/user.entity';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { ApplicationStatus } from '../../common/enums';

@Entity('applications')
@Unique(['userId', 'vacancyId'])
export class Application extends BaseEntity {
  @ApiProperty({ enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiProperty({ nullable: true })
  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'employer_note', type: 'text', nullable: true })
  employerNote: string;

  @Column({ name: 'viewed_at', type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'vacancy_id' })
  vacancyId: string;

  @ManyToOne(() => Vacancy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @Column({ name: 'resume_id', nullable: true })
  resumeId: string;

  @ManyToOne(() => Resume, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;
}
