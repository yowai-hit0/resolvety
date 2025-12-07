import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, AddCommentDto, BulkAssignDto, BulkStatusDto } from './dto/ticket.dto';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateTicketCode;
    findAll(skip?: number, take?: number, filters?: {
        status?: string;
        priority?: string;
        assignee?: string;
        created_by?: string;
        updated_by?: string;
        category?: string;
        search?: string;
        created_at_from?: string;
        created_at_to?: string;
        updated_at_from?: string;
        updated_at_to?: string;
    }): Promise<{
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
            _count: {
                comments: number;
                attachments: number;
            };
            assignee: {
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
            categories: ({
                category: {
                    id: string;
                    is_active: boolean;
                    created_at: Date;
                    updated_at: Date;
                    created_by_id: string | null;
                    updated_by_id: string | null;
                    name: string;
                };
            } & {
                id: string;
                created_at: Date;
                ticket_id: string;
                category_id: string;
            })[];
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
        })[];
        total: number;
        skip: number;
        take: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        ticket_code: string;
        subject: string;
        description: string;
        requester_email: string;
        requester_name: string;
        requester_phone: string;
        location: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        created_at: Date;
        updated_at: Date;
        resolved_at: Date;
        closed_at: Date;
        created_by_id: string;
        updated_by_id: string;
        assignee_id: string;
        priority_id: string;
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
        assignee: {
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
        categories: ({
            category: {
                id: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
                name: string;
            };
        } & {
            id: string;
            created_at: Date;
            ticket_id: string;
            category_id: string;
        })[];
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
            is_internal: boolean;
            ticket_id: string;
            author_id: string;
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
            original_filename: string;
            stored_filename: string;
            mime_type: string;
            size: bigint;
            ticket_id: string;
            is_deleted: boolean;
            uploaded_at: Date;
            deleted_at: Date | null;
            uploaded_by_id: string;
            deleted_by_id: string | null;
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
            user_id: string;
            ip_address: string | null;
            ticket_id: string;
            change_type: string;
            old_value: string | null;
            new_value: string | null;
        })[];
    }>;
    create(dto: CreateTicketDto, userId: string): Promise<{
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
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            name: string;
            sort_order: number;
        };
        categories: ({
            category: {
                id: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
                name: string;
            };
        } & {
            id: string;
            created_at: Date;
            ticket_id: string;
            category_id: string;
        })[];
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
    }>;
    update(id: string, dto: UpdateTicketDto, userId: string): Promise<{
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
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
            name: string;
            sort_order: number;
        };
        categories: ({
            category: {
                id: string;
                is_active: boolean;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
                name: string;
            };
        } & {
            id: string;
            created_at: Date;
            ticket_id: string;
            category_id: string;
        })[];
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
    }>;
    addComment(ticketId: string, dto: AddCommentDto, userId: string): Promise<{
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
        is_internal: boolean;
        ticket_id: string;
        author_id: string;
    }>;
    getStats(): Promise<{
        total: number;
        by_status: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TicketGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        by_priority: {
            priority_id: any;
            priority_name: any;
            _count: any;
        }[];
        recent_7_days: number;
    }>;
    bulkAssign(dto: BulkAssignDto, userId: string): Promise<{
        updated: number;
    }>;
    bulkStatus(dto: BulkStatusDto, userId: string): Promise<{
        updated: number;
    }>;
    addAttachment(ticketId: string, dto: any, userId: string): Promise<{
        uploaded_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    } & {
        id: string;
        original_filename: string;
        stored_filename: string;
        mime_type: string;
        size: bigint;
        ticket_id: string;
        is_deleted: boolean;
        uploaded_at: Date;
        deleted_at: Date | null;
        uploaded_by_id: string;
        deleted_by_id: string | null;
    }>;
    deleteAttachment(attachmentId: string, userId: string): Promise<{
        message: string;
    }>;
}
