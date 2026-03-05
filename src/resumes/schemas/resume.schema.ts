import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResumeDocument = Resume & Document;

export enum ResumeStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  DRAFT = 'draft',
}

export class WorkExperience {
  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  position: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: false })
  isCurrent: boolean;
}

export class Education {
  @Prop({ required: true })
  institution: string;

  @Prop({ required: true })
  degree: string;

  @Prop()
  field: string;

  @Prop()
  startYear: number;

  @Prop()
  endYear: number;
}

export class Language {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  level: string; 
}

@Schema({ timestamps: true, versionKey: false })
export class Resume {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  title: string; // e.g., "Backend Dasturchi"

  @Prop()
  summary: string; 

  // Tajriba
  @Prop({ type: [{ type: Object }], default: [] })
  experience: WorkExperience[];

  // Ta'lim
  @Prop({ type: [{ type: Object }], default: [] })
  education: Education[];

  // Ko'nikmalar
  @Prop({ type: [String], default: [] })
  skills: string[];

  // Tillar
  @Prop({ type: [{ type: Object }], default: [] })
  languages: Language[];

  // Maqsadli ish
  @Prop()
  desiredPosition: string;

  @Prop({ type: Number })
  desiredSalaryMin: number;

  @Prop({ type: Number })
  desiredSalaryMax: number;

  @Prop({ default: 'UZS' })
  currency: string;

  @Prop()
  employmentType: string;

  @Prop()
  city: string;

  @Prop({ default: false })
  readyToRelocate: boolean;

  @Prop({ default: false })
  readyForRemote: boolean;

  // Fayl
  @Prop()
  filePath: string; 

  @Prop({ type: String, enum: ResumeStatus, default: ResumeStatus.ACTIVE })
  status: ResumeStatus;

  @Prop({ default: 0 })
  views: number;

  createdAt: Date;
  updatedAt: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);

ResumeSchema.index({ owner: 1 });
ResumeSchema.index({ status: 1 });
ResumeSchema.index({ skills: 1 });
ResumeSchema.index({ title: 'text', summary: 'text', skills: 'text' });
