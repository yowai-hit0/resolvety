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
    }>;
    getTickets(userId: string, skip?: number, take?: number, status?: string, priorityId?: string, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: ({
            _count: {
                comments: number;
                attachments: number;
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
    updateTicketStatus(ticketId: string, status: TicketStatus, userId: string): Promise<{
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
    updateTicketPriority(ticketId: string, priorityId: string, userId: string): Promise<{
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
    }>;
    getPerformance(userId: string): Promise<{
        total_assigned: number;
        resolved: number;
        resolution_rate: number;
        avg_resolution_days: unknown;
        recent_activity: {
            id: string;
            created_at: Date;
            subject: string;
            ticket_code: string;
            resolved_at: Date;
        }[];
    }>;
}
