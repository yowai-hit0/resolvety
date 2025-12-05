import { PrioritiesService } from './priorities.service';
declare class CreatePriorityDto {
    name: string;
    sort_order?: number;
}
declare class UpdatePriorityDto {
    name: string;
    sort_order?: number;
}
export declare class PrioritiesController {
    private prioritiesService;
    constructor(prioritiesService: PrioritiesService);
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
    create(dto: CreatePriorityDto, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    update(id: string, dto: UpdatePriorityDto, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        sort_order: number;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    delete(id: string, req: any): Promise<{
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
export {};
