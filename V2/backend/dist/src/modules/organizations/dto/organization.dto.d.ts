export declare class CreateOrganizationDto {
    name: string;
    domain?: string;
    email?: string;
    phone?: string;
    address?: string;
}
export declare class UpdateOrganizationDto {
    name?: string;
    domain?: string;
    email?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}
