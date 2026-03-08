import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApplicationStatus } from '../../common/enums';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Vakansiya UUID' })
  @IsUUID('4')
  vacancyId: string;

  @ApiPropertyOptional({ description: 'Rezyume UUID' })
  @IsOptional()
  @IsUUID('4')
  resumeId?: string;

  @ApiPropertyOptional({ example: 'Siz bilan ishlashni xohlayman chunki...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Siz bilan intervyu otkazmoqchimiz' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  employerNote?: string;
}
