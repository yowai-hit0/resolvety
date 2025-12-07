"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(dto, ipAddress) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user || !user.password_hash) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (!user.is_active) {
                throw new common_1.UnauthorizedException('Account is inactive');
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    last_login_at: new Date(),
                    last_login_ip: ipAddress || null,
                },
            });
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
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
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
        const tokens = await this.generateTokens(user.id, user.email);
        return {
            user,
            ...tokens,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || !user.is_active) {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            return this.generateTokens(user.id, user.email);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getProfile(userId) {
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
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password_hash: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password_hash: newPasswordHash,
                updated_at: new Date(),
            },
        });
        return { message: 'Password changed successfully' };
    }
    async forgotPassword(dto, ipAddress) {
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
        if (!user || !user.is_active) {
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        await this.prisma.passwordReset.create({
            data: {
                user_id: user.id,
                token,
                expires_at: expiresAt,
                ip_address: ipAddress || null,
            },
        });
        return {
            message: 'If an account with that email exists, a password reset link has been sent.',
            ...(process.env.NODE_ENV === 'development' && { token, expiresAt }),
        };
    }
    async resetPassword(dto, ipAddress) {
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
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        if (resetRecord.used_at) {
            throw new common_1.UnauthorizedException('This reset token has already been used');
        }
        if (new Date() > resetRecord.expires_at) {
            throw new common_1.UnauthorizedException('Reset token has expired');
        }
        if (!resetRecord.user.is_active) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
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
    async generateTokens(userId, email) {
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
        }
        catch (error) {
            console.error('Token generation error:', error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map