import { PrismaService } from '../../../prisma/prisma.service';
export declare class PrioritiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            tickets: number;
        };
    } & {
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    create(name: string, sortOrder: number, userId: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    update(id: string, name: string, sortOrder: number, userId: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
}
