import { UsersService } from './users.service';
import { UpdateUserDto, UpdateUserStatusDto, CreateUserDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(skip?: string, take?: string, role?: string, is_active?: string, organization?: string, search?: string): Promise<{
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
    getStats(): Promise<{
        total: number;
        by_role: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        active: number;
        recent_30_days: number;
    }>;
    create(dto: CreateUserDto, req: any): Promise<{
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
    getMe(req: any): Promise<{
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
    update(id: string, dto: UpdateUserDto, req: any): Promise<{
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
    updateStatus(id: string, dto: UpdateUserStatusDto, req: any): Promise<{
        id: string;
        is_active: boolean;
        email: string;
    }>;
}
