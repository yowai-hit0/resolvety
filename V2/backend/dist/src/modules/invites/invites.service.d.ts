import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, InviteStatus } from '@prisma/client';
export declare class InvitesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(status?: InviteStatus, email?: string, skip?: number, take?: number): Promise<{
        data: {
            id: string;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.InviteStatus;
            token: string;
            expires_at: Date;
            accepted_at: Date | null;
        }[];
        total: number;
        skip: number;
        take: number;
    }>;
    create(email: string, role: UserRole, expiresInHours: number, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.InviteStatus;
        token: string;
        expires_at: Date;
        accepted_at: Date | null;
    }>;
    resend(id: string, userId: string): Promise<{
        message: string;
        invite: {
            id: string;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.InviteStatus;
            token: string;
            expires_at: Date;
            accepted_at: Date | null;
        };
    }>;
    revoke(id: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.InviteStatus;
        token: string;
        expires_at: Date;
        accepted_at: Date | null;
    }>;
    accept(token: string, password: string, firstName: string, lastName: string): Promise<{
        user: {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            email: string;
            password_hash: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
            last_login_at: Date | null;
            last_login_ip: string | null;
            organization_id: string | null;
        };
        message: string;
    }>;
}
