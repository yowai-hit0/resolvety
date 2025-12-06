import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, ip: string): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): Promise<{
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
    changePassword(dto: ChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto, ip: string): Promise<{
        message: string;
    } | {
        token: any;
        expiresAt: Date;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto, ip: string): Promise<{
        message: string;
    }>;
}
