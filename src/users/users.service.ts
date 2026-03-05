import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Foydalanuvchi yaratish
  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  // ID bo‘yicha foydalanuvchi topish
  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(new Types.ObjectId(id)).exec();
  }

  // ID bo‘yicha foydalanuvchi + password bilan
  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(new Types.ObjectId(id)).select('+password').exec();
  }

  // Email bo‘yicha foydalanuvchi topish
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  // Email bo‘yicha foydalanuvchi + password bilan
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  // Profilni yangilash
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('Foydalanuvchi topilmadi');

    const user = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { $set: dto },
      { new: true, runValidators: true },
    ).exec();

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  // Parolni yangilash
  async updatePassword(userId: string, hashedPassword: string) {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { password: hashedPassword },
      { new: true },
    ).exec();
  }

  // Refresh token yangilash
  async updateRefreshToken(userId: string, refreshToken: string | null) {
    const hashed = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { refreshToken: hashed },
      { new: true },
    ).exec();
  }

  // Avatarni yangilash
  async updateAvatar(userId: string, avatarPath: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('Foydalanuvchi topilmadi');

    const user = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { avatar: avatarPath },
      { new: true },
    ).exec();

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  // Foydalanuvchilar ro‘yxati (employers)
  async findAllEmployers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const filter: mongoose.QueryFilter<UserDocument> = {
      role: 'employer',
      status: UserStatus.ACTIVE,
    };

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // deactive
  async deactivate(userId: string) {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('Foydalanuvchi topilmadi');

    const user = await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      { status: UserStatus.INACTIVE },
      { new: true },
    ).exec();

    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return { message: 'Hisob o‘chirildi' };
  }
}