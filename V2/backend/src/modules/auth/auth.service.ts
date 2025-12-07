import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string) {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user || !user.password_hash) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          last_login_at: new Date(),
          last_login_ip: ipAddress || null,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        role: 'customer',
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        organization_id: true,
        created_at: true,
        last_login_at: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    // Get user with password hash
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password_hash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date(),
      },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto, ipAddress?: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
      },
    });

    // Always return success message (security best practice - don't reveal if email exists)
    if (!user || !user.is_active) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Create password reset record
    await this.prisma.passwordReset.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
        ip_address: ipAddress || null,
      },
    });

    // TODO: Send email with reset link
    // For now, we'll just return success
    // In production, you would send an email like:
    // await this.emailService.sendPasswordResetEmail(user.email, token);

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
      // In development, you might want to return the token for testing
      // Remove this in production!
      ...(process.env.NODE_ENV === 'development' && { token, expiresAt }),
    };
  }

  async resetPassword(dto: ResetPasswordDto, ipAddress?: string) {
    // Find password reset record
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            is_active: true,
          },
        },
      },
    });

    if (!resetRecord) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (resetRecord.used_at) {
      throw new UnauthorizedException('This reset token has already been used');
    }

    if (new Date() > resetRecord.expires_at) {
      throw new UnauthorizedException('Reset token has expired');
    }

    if (!resetRecord.user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update user password and mark reset token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.user_id },
        data: {
          password_hash: newPasswordHash,
          updated_at: new Date(),
        },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: {
          used_at: new Date(),
        },
      }),
    ]);

    return { message: 'Password has been reset successfully. You can now login with your new password.' };
  }

  private async generateTokens(userId: string, email: string) {
    try {
      const payload = { sub: userId, email };
      const jwtSecret = this.configService.get('JWT_SECRET');
      
      if (!jwtSecret) {
        console.error('JWT_SECRET is not set!');
        throw new Error('JWT_SECRET is not configured');
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.get('JWT_REFRESH_SECRET') || jwtSecret,
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
        }),
      ]);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }
}

