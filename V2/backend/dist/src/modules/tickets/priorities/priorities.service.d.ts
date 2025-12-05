import { PrismaService } from '../../../prisma/prisma.service';
export declare class PrioritiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        sort_order: number;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            tickets: number;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        sort_order: number;
    }>;
    create(name: string, sortOrder: number, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        sort_order: number;
    }>;
    update(id: string, name: string, sortOrder: number, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        sort_order: number;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
        sort_order: number;
    }>;
}
