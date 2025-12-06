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
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        sort_order: number;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            tickets: number;
        };
    } & {
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        sort_order: number;
    }>;
    create(dto: CreatePriorityDto, req: any): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        sort_order: number;
    }>;
    update(id: string, dto: UpdatePriorityDto, req: any): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        sort_order: number;
    }>;
    delete(id: string, req: any): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        sort_order: number;
    }>;
}
export {};
