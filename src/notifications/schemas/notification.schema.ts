import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_VIEWED   = 'application_viewed',
  APPLICATION_INVITED  = 'application_invited',
  APPLICATION_REJECTED = 'application_rejected',
  APPLICATION_HIRED    = 'application_hired',
  SYSTEM               = 'system',
}

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @ApiProperty()
  @Prop({ required: true })
  userId: string;

  @ApiProperty({ enum: NotificationType })
  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  message: string;

  @ApiProperty({ nullable: true })
  @Prop({ type: Object, default: null })
  data: Record<string, any>;

  @ApiProperty({ default: false })
  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: null })
  readAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
