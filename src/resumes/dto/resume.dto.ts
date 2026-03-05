import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkExperienceDto {
  @ApiProperty({ example: 'Texnopark LLC' })
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiProperty({ example: 'Backend Dasturchi' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiPropertyOptional({ example: 'Node.js bilan microservice arxitekturasi...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2021-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class EducationDto {
  @ApiProperty({ example: 'TATU' })
  @IsNotEmpty()
  @IsString()
  institution: string;

  @ApiProperty({ example: 'Bakalavr' })
  @IsNotEmpty()
  @IsString()
  degree: string;

  @ApiPropertyOptional({ example: 'Kompyuter muhandisligi' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({ example: 2018 })
  @IsOptional()
  @IsNumber()
  startYear?: number;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional()
  @IsNumber()
  endYear?: number;
}

export class LanguageDto {
  @ApiProperty({ example: 'Ingliz tili' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'B2' })
  @IsNotEmpty()
  @IsString()
  level: string;
}

export class CreateResumeDto {
  @ApiProperty({ example: 'Backend Dasturchi (Node.js)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: '5 yillik tajribali backend dasturchi...' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ type: [WorkExperienceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceDto)
  experience?: WorkExperienceDto[];

  @ApiPropertyOptional({ type: [EducationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @ApiPropertyOptional({ example: ['Node.js', 'MongoDB', 'NestJS', 'TypeScript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(30)
  skills?: string[];

  @ApiPropertyOptional({ type: [LanguageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages?: LanguageDto[];

  @ApiPropertyOptional({ example: 'Senior Backend Dasturchi' })
  @IsOptional()
  @IsString()
  desiredPosition?: string;

  @ApiPropertyOptional({ example: 10000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  desiredSalaryMin?: number;

  @ApiPropertyOptional({ example: 25000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  desiredSalaryMax?: number;

  @ApiPropertyOptional({ default: 'UZS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'full_time' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  readyToRelocate?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  readyForRemote?: boolean;
}

export class UpdateResumeDto extends PartialType(CreateResumeDto) {}

export class ResumeQueryDto {
  @ApiPropertyOptional({ example: 'node.js dasturchi' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Node.js' })
  @IsOptional()
  @IsString()
  skill?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
