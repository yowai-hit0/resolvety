import { PublicApiService } from './public-api.service';
import { ApiRegisterUserDto, ApiCreateTicketDto } from './dto/public-api.dto';
export declare class PublicApiController {
    private publicApiService;
    constructor(publicApiService: PublicApiService);
    registerUser(dto: ApiRegisterUserDto, req: any): Promise<{
        id: string;
        organization_id: string;
        created_at: Date;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    createTicket(dto: ApiCreateTicketDto, req: any): Promise<{
        created_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        assignee: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        priority: {
            id: string;
            name: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            sort_order: number;
        };
        categories: ({
            category: {
                id: string;
                name: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            category_id: string;
            ticket_id: string;
        })[];
    } & {
        id: string;
        description: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string;
        updated_by_id: string | null;
        ticket_code: string;
        subject: string;
        requester_email: string | null;
        requester_name: string | null;
        requester_phone: string;
        location: string | null;
        status: import(".prisma/client").$Enums.TicketStatus;
        resolved_at: Date | null;
        closed_at: Date | null;
        assignee_id: string | null;
        priority_id: string;
    }>;
    getUserTickets(userId: string, status?: string, skip?: string, take?: string, req?: any): Promise<{
        data: ({
            created_by: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
            updated_by: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
            comments: ({
                author: {
                    id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                };
            } & {
                id: string;
                created_at: Date;
                updated_at: Date;
                updated_by_id: string | null;
                content: string;
                ticket_id: string;
                is_internal: boolean;
                author_id: string;
            })[];
            ticket_events: ({
                user: {
                    id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                };
            } & {
                id: string;
                created_at: Date;
                ip_address: string | null;
                user_id: string;
                ticket_id: string;
                change_type: string;
                old_value: string | null;
                new_value: string | null;
            })[];
            attachments: ({
                uploaded_by: {
                    id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                };
            } & {
                id: string;
                ticket_id: string;
                original_filename: string;
                stored_filename: string;
                mime_type: string;
                size: bigint;
                is_deleted: boolean;
                uploaded_at: Date;
                deleted_at: Date | null;
                uploaded_by_id: string;
                deleted_by_id: string | null;
            })[];
            assignee: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
            priority: {
                id: string;
                name: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
                sort_order: number;
            };
            categories: ({
                category: {
                    id: string;
                    name: string;
                    is_active: boolean;
                    created_at: Date;
                    updated_at: Date;
                    created_by_id: string | null;
                    updated_by_id: string | null;
                };
            } & {
                id: string;
                created_at: Date;
                category_id: string;
                ticket_id: string;
            })[];
        } & {
            id: string;
            description: string;
            created_at: Date;
            updated_at: Date;
            created_by_id: string;
            updated_by_id: string | null;
            ticket_code: string;
            subject: string;
            requester_email: string | null;
            requester_name: string | null;
            requester_phone: string;
            location: string | null;
            status: import(".prisma/client").$Enums.TicketStatus;
            resolved_at: Date | null;
            closed_at: Date | null;
            assignee_id: string | null;
            priority_id: string;
        })[];
        total: number;
        skip: number;
        take: number;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    }>;
    getUserTicket(ticketId: string, userId: string, req?: any): Promise<{
        created_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        updated_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        comments: ({
            author: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            updated_by_id: string | null;
            content: string;
            ticket_id: string;
            is_internal: boolean;
            author_id: string;
        })[];
        ticket_events: ({
            user: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
        } & {
            id: string;
            created_at: Date;
            ip_address: string | null;
            user_id: string;
            ticket_id: string;
            change_type: string;
            old_value: string | null;
            new_value: string | null;
        })[];
        attachments: ({
            uploaded_by: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
        } & {
            id: string;
            ticket_id: string;
            original_filename: string;
            stored_filename: string;
            mime_type: string;
            size: bigint;
            is_deleted: boolean;
            uploaded_at: Date;
            deleted_at: Date | null;
            uploaded_by_id: string;
            deleted_by_id: string | null;
        })[];
        assignee: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        priority: {
            id: string;
            name: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            sort_order: number;
        };
        categories: ({
            category: {
                id: string;
                name: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            category_id: string;
            ticket_id: string;
        })[];
    } & {
        id: string;
        description: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string;
        updated_by_id: string | null;
        ticket_code: string;
        subject: string;
        requester_email: string | null;
        requester_name: string | null;
        requester_phone: string;
        location: string | null;
        status: import(".prisma/client").$Enums.TicketStatus;
        resolved_at: Date | null;
        closed_at: Date | null;
        assignee_id: string | null;
        priority_id: string;
    }>;
    getCategories(req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
    }[]>;
    getPriorities(req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        sort_order: number;
    }[]>;
    getUserProfile(phone: string, req?: any): Promise<{
        id: string;
        organization_id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        email: string;
        first_name: string;
        last_name: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
