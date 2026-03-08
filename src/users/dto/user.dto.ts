import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsString, MinLength, MaxLength,
  IsEnum, IsOptional, Matches,
} from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'shahriyorqadirov@mail.com' })
  @IsEmail({}, { message: 'Email notogri' })
  email: string;

  @ApiProperty({ example: 'Parol123' })
  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 ta belgi' })
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'shahriyor' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'qadirov' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.JOBSEEKER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: '+998953484247' })
  @IsOptional()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Telefon +998XXXXXXXXX formatida bolsin' })
  phoneNumber?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'shahriyor' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'qadirov' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ example: '+998953484247' })
  @IsOptional()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Telefon +998XXXXXXXXX formatida bolsin' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  about?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Yangi parol kamida 8 ta belgi' })
  @MaxLength(50)
  newPassword: string;
}
