import { AgentService } from './agent.service';
import { UpdateTicketStatusDto, UpdateTicketPriorityDto } from './dto/agent.dto';
export declare class AgentController {
    private agentService;
    constructor(agentService: AgentService);
    getDashboard(req: any): Promise<{
        stats: {
            assigned_tickets: number;
            open_tickets: number;
            resolved_today: number;
        };
        recent_tickets: ({
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
            categories: ({
                category: {
                    id: string;
                    created_at: Date;
                    updated_at: Date;
                    created_by_id: string | null;
                    updated_by_id: string | null;
                    name: string;
                    is_active: boolean;
                };
            } & {
                id: string;
                created_at: Date;
                ticket_id: string;
                category_id: string;
            })[];
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
        })[];
    }>;
    getTickets(req: any, skip?: string, take?: string, status?: string, priority?: string, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: ({
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
            categories: ({
                category: {
                    id: string;
                    created_at: Date;
                    updated_at: Date;
                    created_by_id: string | null;
                    updated_by_id: string | null;
                    name: string;
                    is_active: boolean;
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
        })[];
        total: number;
        skip: number;
        take: number;
    }>;
    updateTicketStatus(id: string, dto: UpdateTicketStatusDto, req: any): Promise<{
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
        categories: ({
            category: {
                id: string;
                created_at: Date;
                updated_at: Date;
                created_by_id: string | null;
                updated_by_id: string | null;
                name: string;
                is_active: boolean;
            };
        } & {
            id: string;
            created_at: Date;
            ticket_id: string;
            category_id: string;
        })[];
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
    }>;
    updateTicketPriority(id: string, dto: UpdateTicketPriorityDto, req: any): Promise<{
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
    }>;
    getPerformance(req: any): Promise<{
        total_assigned: number;
        resolved: number;
        resolution_rate: number;
        avg_resolution_days: unknown;
        recent_activity: {
            id: string;
            ticket_code: string;
            subject: string;
            created_at: Date;
            resolved_at: Date;
        }[];
    }>;
}
