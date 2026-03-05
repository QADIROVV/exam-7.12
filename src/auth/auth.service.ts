import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // validater user
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _pass, ...result } = user.toObject();
    return result;
  }

  // register
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }

    if (dto.role === 'employer' && !dto.companyName) {
      throw new BadRequestException('Ish beruvchi uchun kompaniya nomi talab qilinadi');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, password: hashed });

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tildi',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // login
  async login(user: any) {
    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Muvaffaqiyatli kirildi',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // refresh token
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Ruxsat yo\'q');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!rtMatches) {
      throw new UnauthorizedException('Refresh token yaroqsiz');
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  // logout
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Muvaffaqiyatli chiqildi' };
  }

  // change password
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Eski parol noto\'g\'ri');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(userId, hashed);

    return { message: 'Parol muvaffaqiyatli o\'zgartirildi' };
  }

  // profil
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }

  // generatortokens
  private async generateTokens(user: any) {
    const payload = {
      sub: user._id?.toString() || user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'secret'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'secret'),
        expiresIn: '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : user;
    const { password, refreshToken, __v, ...clean } = obj;
    return clean;
  }
}
