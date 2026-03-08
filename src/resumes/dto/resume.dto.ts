import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsEnum, IsOptional, IsNumber, IsBoolean,
  IsArray, ValidateNested, IsInt, Min, MinLength, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceLevel, Currency } from '../../common/enums';

export class ExperienceItemDto {
  @ApiProperty({ example: 'UZINFOCOM' })
  @IsString()
  @MinLength(2)
  company: string;

  @ApiProperty({ example: 'Backend Developer' })
  @IsString()
  position: string;

  @ApiProperty({ example: '2021-01' })
  @IsString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-01' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  isCurrent: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class EducationItemDto {
  @ApiProperty({ example: 'TATU' })
  @IsString()
  institution: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional({ example: 'Bakalavr' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiProperty({ example: 2017 })
  @IsInt()
  @Min(1950)
  startYear: number;

  @ApiPropertyOptional({ example: 2021 })
  @IsOptional()
  @IsInt()
  endYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class CreateResumeDto {
  @ApiProperty({ example: 'Senior Backend Developer' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: '5 yillik tajribali backend dasturchi...' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ example: 7000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  desiredSalary?: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.UZS })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRemoteOk?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['NestJS', 'PostgreSQL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ type: [ExperienceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceItemDto)
  experience?: ExperienceItemDto[];

  @ApiPropertyOptional({ type: [EducationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationItemDto)
  education?: EducationItemDto[];

  @ApiPropertyOptional({ example: [{ name: "O'zbek", level: 'native' }] })
  @IsOptional()
  @IsArray()
  languages?: Array<{ name: string; level: string }>;
}
