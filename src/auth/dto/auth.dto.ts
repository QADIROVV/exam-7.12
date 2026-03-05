import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'Qadirov Shahriyor', description: 'To\'liq ism' })
  @IsNotEmpty({ message: 'Ism bo\'sh bo\'lmasligi kerak' })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'qadirovshahriyor59', description: 'Email manzil' })
  @IsEmail({}, { message: 'Noto\'g\'ri email format' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Parol (min 8 belgi)' })
  @IsString()
  @MinLength(8, { message: 'Parol kamida 8 belgidan iborat bo\'lishi kerak' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Parolda katta harf, kichik harf va raqam bo\'lishi kerak',
  })
  password: string;

  @ApiPropertyOptional({ example: '+998953484247' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.JOBSEEKER })
  @IsEnum(UserRole, { message: 'Role jobseeker yoki employer bo\'lishi kerak' })
  role: UserRole;

  @ApiPropertyOptional({ example: 'Texnopark LLC' })
  @IsOptional()
  @IsString()
  companyName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'qadirovshahriyor59' })
  @IsEmail({}, { message: 'Noto\'g\'ri email format' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty({ message: 'Parol bo\'sh bo\'lmasligi kerak' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Parolda katta harf, kichik harf va raqam bo\'lishi kerak',
  })
  newPassword: string;
}
