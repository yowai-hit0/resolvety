import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, UpdateUserStatusDto, CreateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(skip?: number, take?: number, filters?: {
        role?: string;
        is_active?: boolean;
        organization?: string;
        search?: string;
    }): Promise<{
        data: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
            is_active: boolean;
            created_at: Date;
            last_login_at: Date;
            user_organizations: ({
                organization: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                organization_id: string;
                created_at: Date;
                created_by_id: string | null;
                user_id: string;
                is_primary: boolean;
            })[];
        }[];
        total: number;
        skip: number;
        take: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        organization_id: string;
        created_at: Date;
        updated_at: Date;
        last_login_at: Date;
        last_login_ip: string;
        organization: {
            id: string;
            name: string;
        };
        user_organizations: ({
            organization: {
                id: string;
                name: string;
                domain: string;
            };
        } & {
            id: string;
            organization_id: string;
            created_at: Date;
            created_by_id: string | null;
            user_id: string;
            is_primary: boolean;
        })[];
        _count: {
            tickets_created: number;
            tickets_assigned: number;
            comments: number;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        organization_id: string;
        created_at: Date;
        updated_at: Date;
        last_login_at: Date;
        last_login_ip: string;
        organization: {
            id: string;
            name: string;
        };
        user_organizations: ({
            organization: {
                id: string;
                name: string;
                domain: string;
            };
        } & {
            id: string;
            organization_id: string;
            created_at: Date;
            created_by_id: string | null;
            user_id: string;
            is_primary: boolean;
        })[];
        _count: {
            tickets_created: number;
            tickets_assigned: number;
            comments: number;
        };
    }>;
    update(id: string, dto: UpdateUserDto, updatedBy: string): Promise<{
        organization: {
            id: string;
            name: string;
        };
        user_organizations: ({
            organization: {
                id: string;
                name: string;
                domain: string;
            };
        } & {
            id: string;
            organization_id: string;
            created_at: Date;
            created_by_id: string | null;
            user_id: string;
            is_primary: boolean;
        })[];
    } & {
        id: string;
        email: string;
        password_hash: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        organization_id: string | null;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        last_login_at: Date | null;
        last_login_ip: string | null;
    }>;
    updateStatus(id: string, dto: UpdateUserStatusDto, updatedBy: string): Promise<{
        id: string;
        email: string;
        is_active: boolean;
    }>;
    create(dto: CreateUserDto, createdBy: string): Promise<{
        organization: {
            id: string;
            name: string;
        };
        user_organizations: ({
            organization: {
                id: string;
                name: string;
                domain: string;
            };
        } & {
            id: string;
            organization_id: string;
            created_at: Date;
            created_by_id: string | null;
            user_id: string;
            is_primary: boolean;
        })[];
    } & {
        id: string;
        email: string;
        password_hash: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        organization_id: string | null;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        last_login_at: Date | null;
        last_login_ip: string | null;
    }>;
    getStats(): Promise<{
        total: number;
        by_role: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        active: number;
        recent_30_days: number;
    }>;
}
