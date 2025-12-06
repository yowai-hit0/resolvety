import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    organization_id?: string;
    organization_ids?: string[];
    is_active?: boolean;
}
export declare class UpdateUserDto {
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    organization_id?: string;
    organization_ids?: string[];
}
export declare class UpdateUserStatusDto {
    is_active: boolean;
}
