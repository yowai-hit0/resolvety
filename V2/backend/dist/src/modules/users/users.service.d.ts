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
            created_at: Date;
            is_active: boolean;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
            last_login_at: Date;
        }[];
        total: number;
        skip: number;
        take: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        _count: {
            comments: number;
            tickets_created: number;
            tickets_assigned: number;
        };
        is_active: boolean;
        email: string;
        organization: {
            id: string;
            name: string;
        };
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        last_login_at: Date;
        last_login_ip: string;
        organization_id: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        _count: {
            comments: number;
            tickets_created: number;
            tickets_assigned: number;
        };
        is_active: boolean;
        email: string;
        organization: {
            id: string;
            name: string;
        };
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        last_login_at: Date;
        last_login_ip: string;
        organization_id: string;
    }>;
    update(id: string, dto: UpdateUserDto, updatedBy: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        is_active: boolean;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        organization_id: string;
    }>;
    updateStatus(id: string, dto: UpdateUserStatusDto, updatedBy: string): Promise<{
        id: string;
        is_active: boolean;
        email: string;
    }>;
    create(dto: CreateUserDto, createdBy: string): Promise<{
        id: string;
        created_at: Date;
        is_active: boolean;
        email: string;
        organization: {
            id: string;
            name: string;
        };
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        organization_id: string;
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
