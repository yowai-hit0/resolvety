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
    create(dto: CreateCategoryDto, req: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
    }>;
    update(id: string, dto: UpdateCategoryDto, req: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
    }>;
    delete(id: string, req: any): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
        name: string;
        is_active: boolean;
    }>;
}
export {};
