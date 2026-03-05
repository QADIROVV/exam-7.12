import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type VacancyDocument = Vacancy & Document;

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

export enum ExperienceLevel {
  NO_EXPERIENCE = 'no_experience',
  JUNIOR = 'junior',
  MIDDLE = 'middle',
  SENIOR = 'senior',
  LEAD = 'lead',
}

export enum VacancyStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true, versionKey: false })
export class Vacancy {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  requirements: string;

  @Prop()
  responsibilities: string;

  @Prop()
  conditions: string;

  // Employer
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employer: Types.ObjectId;

  @Prop({ required: true })
  companyName: string;

  @Prop()
  companyLogo: string;

  // Location
  @Prop({ required: true })
  city: string;

  @Prop()
  address: string;

  // Salary
  @Prop({ type: Number })
  salaryMin: number;

  @Prop({ type: Number })
  salaryMax: number;

  @Prop({ default: 'UZS' })
  currency: string;

  @Prop({ default: false })
  salaryNegotiable: boolean;

  // Type & Level
  @Prop({ type: String, enum: EmploymentType, required: true })
  employmentType: EmploymentType;

  @Prop({ type: String, enum: ExperienceLevel, required: true })
  experienceLevel: ExperienceLevel;

  // Category
  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  // Status
  @Prop({ type: String, enum: VacancyStatus, default: VacancyStatus.ACTIVE })
  status: VacancyStatus;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  applications: number;

  createdAt: Date;
  updatedAt: Date;
}

export const VacancySchema = SchemaFactory.createForClass(Vacancy);

// Full-text search index
VacancySchema.index({ title: 'text', description: 'text', skills: 'text', companyName: 'text' });
VacancySchema.index({ employer: 1 });
VacancySchema.index({ status: 1 });
VacancySchema.index({ city: 1 });
VacancySchema.index({ category: 1 });
VacancySchema.index({ employmentType: 1 });
VacancySchema.index({ experienceLevel: 1 });
VacancySchema.index({ createdAt: -1 });
