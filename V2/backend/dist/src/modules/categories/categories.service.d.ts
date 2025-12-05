import { PrismaService } from '../../prisma/prisma.service';
export declare class CategoriesService {
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
    }>;
    create(name: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
    }>;
    update(id: string, name: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
    }>;
}
