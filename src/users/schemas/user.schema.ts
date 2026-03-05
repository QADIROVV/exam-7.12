import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  JOBSEEKER = 'jobseeker',  
  EMPLOYER = 'employer',     
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Schema({ timestamps: true, versionKey: false })
export class User {
  @ApiProperty({ example: 'Qadirov Shahriyor' })
  @Prop({ required: true, trim: true })
  fullName: string;

  @ApiProperty({ example: 'Qadirovshahriyor59' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ example: '+998953484247' })
  @Prop({ trim: true })
  phone: string;

  @ApiProperty({ enum: UserRole, default: UserRole.JOBSEEKER })
  @Prop({ type: String, enum: UserRole, default: UserRole.JOBSEEKER })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, default: UserStatus.ACTIVE })
  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @Prop()
  avatar: string;

  // Employer fields
  @ApiProperty({ example: 'Texnopark LLC' })
  @Prop({ trim: true })
  companyName: string;

  @ApiProperty({ example: 'IT kompaniyasi' })
  @Prop()
  companyDescription: string;

  @ApiProperty({ example: 'https://texnopark.uz' })
  @Prop()
  website: string;

  // Jobseeker fields
  @ApiProperty({ example: 'Toshkent' })
  @Prop()
  city: string;

  @ApiProperty({ example: 'Dasturchi' })
  @Prop()
  position: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  refreshToken: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ companyName: 'text', fullName: 'text' });
