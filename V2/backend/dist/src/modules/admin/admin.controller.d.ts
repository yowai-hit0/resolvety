import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
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
    getUserAnalytics(): Promise<{
        by_role: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        active_users: number;
        recent_users: {
            id: string;
            created_at: Date;
            email: string;
            first_name: string;
            last_name: string;
            role: import(".prisma/client").$Enums.UserRole;
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
