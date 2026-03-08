import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';
import { UserRole, UserStatus } from '../../common/enums';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ example: 'shahriyorqadirov@mail.com' })
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty({ example: 'shahriyor' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ example: 'qadirov' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.JOBSEEKER })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ nullable: true })
  @Column({ name: 'phone_number', type: 'varchar', nullable: true, unique: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  about: string | null;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true, select: false })
  refreshToken: string | null;
}