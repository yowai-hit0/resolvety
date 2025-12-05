import { CategoriesService } from './categories.service';
declare class CreateCategoryDto {
    name: string;
}
declare class UpdateCategoryDto {
    name: string;
}
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: string;
        name: string;
        is_active: boolean;
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
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    create(dto: CreateCategoryDto, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    update(id: string, dto: UpdateCategoryDto, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    delete(id: string, req: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
}
export {};
