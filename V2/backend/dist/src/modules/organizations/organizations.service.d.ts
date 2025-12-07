import { PrismaService } from '../../prisma/prisma.service';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(skip?: number, take?: number): Promise<{
        data: {
            id: string;
            name: string;
            domain: string;
            email: string;
            phone: string;
            address: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string;
            updated_by_id: string;
            _count: {
                users: number;
            };
            tickets_count: number;
        }[];
        total: number;
        skip: number;
        take: number;
    }>;
    findOne(id: string): Promise<{
        tickets_count: number;
        user_organizations: ({
            user: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
                role: import(".prisma/client").$Enums.UserRole;
                is_active: boolean;
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
            user_organizations: number;
            users: number;
        };
        users: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
            is_active: boolean;
        }[];
        id: string;
        email: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        domain: string | null;
        phone: string | null;
        address: string | null;
    }>;
    create(name: string, userId: string, domain?: string, email?: string, phone?: string, address?: string): Promise<{
        id: string;
        email: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        domain: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        id: string;
        email: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        domain: string | null;
        phone: string | null;
        address: string | null;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        email: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        domain: string | null;
        phone: string | null;
        address: string | null;
    }>;
    getUsers(id: string): Promise<{
        is_primary: boolean;
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }[]>;
    getTickets(id: string): Promise<({
        created_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        priority: {
            id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            name: string;
            sort_order: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string;
        updated_by_id: string | null;
        description: string;
        subject: string;
        requester_email: string | null;
        requester_name: string | null;
        requester_phone: string;
        location: string | null;
        priority_id: string;
        assignee_id: string | null;
        status: import(".prisma/client").$Enums.TicketStatus;
        ticket_code: string;
        resolved_at: Date | null;
        closed_at: Date | null;
    })[]>;
}
