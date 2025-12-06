import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
            created_at: Date;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        organization_id: string;
        created_at: Date;
        last_login_at: Date;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto, ipAddress?: string): Promise<{
        message: string;
    } | {
        token: any;
        expiresAt: Date;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto, ipAddress?: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
