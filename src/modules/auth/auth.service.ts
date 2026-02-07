import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

// In-memory OTP store for MVP (replace with Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        ...(dto.email ? { email: dto.email } : { phone: dto.phone }),
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set. Use OTP login.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.role, user.orgId);
  }

  async sendOtp(phone: string) {
    const user = await this.prisma.user.findFirst({
      where: { phone, isActive: true },
    });

    if (!user) {
      throw new BadRequestException('No account found with this phone number');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    otpStore.set(phone, { otp, expiresAt });

    // MVP: log to console instead of sending via WhatsApp/SMS
    console.log(
      `[OTP] Phone: ${phone}, OTP: ${otp}, Expires: ${expiresAt.toISOString()}`,
    );

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const stored = otpStore.get(dto.phone);

    if (!stored) {
      throw new BadRequestException('No OTP found. Request a new one.');
    }

    if (new Date() > stored.expiresAt) {
      otpStore.delete(dto.phone);
      throw new BadRequestException('OTP expired. Request a new one.');
    }

    if (stored.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    otpStore.delete(dto.phone);

    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.role, user.orgId);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, orgId: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user.id, user.role, user.orgId);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        orgId: true,
        isActive: true,
        org: { select: { name: true, logo: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateTokens(userId: string, role: string, orgId: string) {
    const payload: JwtPayload = { userId, role, orgId };

    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('JWT_SECRET') ?? '',
        expiresIn: this.configService.get('JWT_EXPIRES_IN') ?? '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? '',
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
      user: { userId, role, orgId },
    };
  }
}
