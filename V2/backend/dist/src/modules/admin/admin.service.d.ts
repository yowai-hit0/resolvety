import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        stats: {
            total_tickets: number;
            open_tickets: number;
            resolved_tickets: number;
            total_users: number;
            active_agents: number;
        };
        recent_tickets: ({
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
        })[];
        new_tickets_today: number;
        ticket_trends: unknown;
        busiest_agents: {
            agent: {
                id: any;
                email: any;
                first_name: any;
                last_name: any;
            };
            ticket_count: any;
        }[];
        tickets_by_priority: {
            priority_id: any;
            priority_name: any;
            _count: any;
        }[];
        tickets_by_category: {
            category_id: any;
            category_name: any;
            count: any;
        }[];
    }>;
    getAnalytics(): Promise<{
        tickets_by_status: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TicketGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        tickets_by_priority: {
            priority_id: any;
            priority_name: any;
            _count: any;
        }[];
        tickets_by_month: unknown;
        tickets_by_day: unknown;
        users_by_role: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        tickets_by_category: {
            category_id: any;
            category_name: any;
            count: any;
        }[];
    }>;
    getTicketAnalytics(): Promise<{
        by_status: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TicketGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        by_priority: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TicketGroupByOutputType, "priority_id"[]> & {
            _count: number;
        })[];
        resolution_time: {
            created_at: Date;
            resolved_at: Date;
        }[];
        avg_resolution_days: unknown;
    }>;
    getStatusTrend(days?: number): Promise<{
        date: string;
    }[]>;
    getUserAnalytics(): Promise<{
        by_role: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        active_users: number;
        recent_users: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
            created_at: Date;
        }[];
        user_activity: {
            id: string;
            email: string;
            last_login_at: Date;
        }[];
    }>;
    getAgentPerformance(): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        tickets_assigned: number;
        tickets_resolved: number;
        comments_count: number;
    }[]>;
}
