import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';
export declare class AgentService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(userId: string): Promise<{
        stats: {
            assigned_tickets: number;
            open_tickets: number;
            resolved_today: number;
        };
        recent_tickets: ({
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
                ticket_id: string;
                category_id: string;
            })[];
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
        })[];
    }>;
    getTickets(userId: string, skip?: number, take?: number, status?: string, priorityId?: string): Promise<{
        data: ({
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
                ticket_id: string;
                category_id: string;
            })[];
            _count: {
                comments: number;
                attachments: number;
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
        })[];
        total: number;
        skip: number;
        take: number;
    }>;
    updateTicketStatus(ticketId: string, status: TicketStatus, userId: string): Promise<{
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
            ticket_id: string;
            category_id: string;
        })[];
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
    }>;
    updateTicketPriority(ticketId: string, priorityId: string, userId: string): Promise<{
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
    }>;
    getPerformance(userId: string): Promise<{
        total_assigned: number;
        resolved: number;
        resolution_rate: number;
        avg_resolution_days: unknown;
        recent_activity: {
            id: string;
            created_at: Date;
            ticket_code: string;
            subject: string;
            resolved_at: Date;
        }[];
    }>;
}
