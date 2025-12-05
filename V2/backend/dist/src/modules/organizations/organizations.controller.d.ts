import { OrganizationsService } from './organizations.service';
declare class CreateOrganizationDto {
    name: string;
    domain?: string;
    email?: string;
    phone?: string;
    address?: string;
}
declare class UpdateOrganizationDto {
    name?: string;
    domain?: string;
    email?: string;
    phone?: string;
    address?: string;
}
export declare class OrganizationsController {
    private organizationsService;
    constructor(organizationsService: OrganizationsService);
    findAll(skip?: string, take?: string): Promise<{
        data: ({
            _count: {
                users: number;
            };
        } & {
            id: string;
            name: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
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
        users: {
            id: string;
            is_active: boolean;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        _count: {
            users: number;
        };
    } & {
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
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
            name: string;
            is_active: boolean;
            sort_order: number;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string;
        updated_by_id: string | null;
        ticket_code: string;
        subject: string;
        description: string;
        requester_email: string | null;
        requester_name: string | null;
        requester_phone: string;
        location: string | null;
        status: import(".prisma/client").$Enums.TicketStatus;
        resolved_at: Date | null;
        closed_at: Date | null;
        assignee_id: string | null;
        priority_id: string;
    })[]>;
    create(dto: CreateOrganizationDto, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: string, dto: UpdateOrganizationDto, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        domain: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
    }>;
}
export {};
