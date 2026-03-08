import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import { UserStatus } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const emailExists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('Bu email band');

    if (dto.phoneNumber) {
      const phoneExists = await this.usersRepo.findOne({ where: { phoneNumber: dto.phoneNumber } });
      if (phoneExists) throw new ConflictException('Bu telefon band');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ ...dto, password: hashed });

    return this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .addSelect('user.refresh_token')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string): Promise<User> {
    if (id !== currentUserId) {
      throw new ForbiddenException('Faqat oz profilingizni tahrirlang');
    }

    const user = await this.findById(id);

    if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
      const phoneExists = await this.usersRepo.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });

      if (phoneExists) {
        throw new ConflictException('Bu telefon band');
      }
    }

    Object.assign(user, dto);

    return this.usersRepo.save(user);
  }

  async changePassword(
    id: string,
    dto: ChangePasswordDto,
    currentUserId: string,
  ): Promise<{ message: string }> {
    if (id !== currentUserId) {
      throw new ForbiddenException('Faqat oz parolingizni ozgartiring');
    }

    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Joriy parol notogri');
    }

    user.password = await bcrypt.hash(dto.newPassword, 12);

    await this.usersRepo.save(user);

    return { message: 'Parol muvaffaqiyatli ozgartirildi' };
  }

  async saveRefreshToken(id: string, token: string | null): Promise<void> {
    if (token) {
      const hashed = await bcrypt.hash(token, 10);

      await this.usersRepo.update(id, {
        refreshToken: hashed,
      });
    } else {
      await this.usersRepo.update(id, {
        refreshToken: null,
      });
    }
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    await this.usersRepo.update(id, { avatarUrl });

    return this.findById(id);
  }

  async deactivate(id: string, currentUserId: string): Promise<{ message: string }> {
    if (id !== currentUserId) {
      throw new ForbiddenException('Ruxsat yoq');
    }

    await this.findById(id);

    await this.usersRepo.update(id, {
      status: UserStatus.INACTIVE,
    });

    return { message: 'Akkount deaktivatsiya qilindi' };
  }
}