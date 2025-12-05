import { InvitesService } from './invites.service';
import { UserRole, InviteStatus } from '@prisma/client';
declare class CreateInviteDto {
    email: string;
    role: UserRole;
    expiresInHours?: number;
}
declare class AcceptInviteDto {
    token: string;
    password: string;
    first_name: string;
    last_name: string;
}
export declare class InvitesController {
    private invitesService;
    constructor(invitesService: InvitesService);
    findAll(status?: InviteStatus, email?: string, skip?: string, take?: string): Promise<{
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
    create(dto: CreateInviteDto, req: any): Promise<{
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
    resend(id: string, req: any): Promise<{
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
    revoke(id: string, req: any): Promise<{
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
    accept(dto: AcceptInviteDto): Promise<{
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
export {};
