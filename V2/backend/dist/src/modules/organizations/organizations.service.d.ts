import { PrismaService } from '../../prisma/prisma.service';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(skip?: number, take?: number): Promise<{
        data: ({
            _count: {
                users: number;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            name: string;
            is_active: boolean;
            domain: string | null;
            email: string | null;
            phone: string | null;
            address: string | null;
        })[];
        total: number;
        skip: number;
        take: number;
    }>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
        };
        users: {
            id: string;
            is_active: boolean;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
    create(name: string, userId: string, domain?: string, email?: string, phone?: string, address?: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
    getUsers(id: string): Promise<{
        id: string;
        is_active: boolean;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
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
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            name: string;
            is_active: boolean;
            sort_order: number;
        };
    } & {
        id: string;
        ticket_code: string;
        subject: string;
        description: string;
        requester_email: string | null;
        requester_name: string | null;
        requester_phone: string;
        location: string | null;
        status: import(".prisma/client").$Enums.TicketStatus;
        created_at: Date;
        updated_at: Date;
        resolved_at: Date | null;
        closed_at: Date | null;
        created_by_id: string;
        updated_by_id: string | null;
        assignee_id: string | null;
        priority_id: string;
    })[]>;
}
