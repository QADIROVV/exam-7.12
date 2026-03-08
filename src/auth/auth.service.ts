import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const tokens = await this.makeTokens(user);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: this.clean(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Email yoki parol notogri');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Email yoki parol notogri');

    const tokens = await this.makeTokens(user);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: this.clean(user), ...tokens };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.saveRefreshToken(userId, null);
    return { message: 'Tizimdan chiqildi' };
  }

  async refresh(userId: string, dto: RefreshTokenDto) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId)).email,
    );
    if (!user?.refreshToken) throw new UnauthorizedException('Qaytadan login qiling');

    const ok = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!ok) throw new UnauthorizedException('Refresh token notogri');

    const tokens = await this.makeTokens(user);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  private async makeTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret:    this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private clean(user: User) {
    const { password, refreshToken, ...result } = user as any;
    return result;
  }
}
