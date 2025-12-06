export declare class CreateAppDto {
    name: string;
    description?: string;
    organization_id: string;
}
export declare class UpdateAppDto {
    name?: string;
    description?: string;
    is_active?: boolean;
}
export declare class CreateApiKeyDto {
    name?: string;
    expires_at?: string;
}
export declare class CreateIpWhitelistDto {
    ip_address: string;
    description?: string;
}
export declare class UpdateIpWhitelistDto {
    ip_address?: string;
    description?: string;
    is_active?: boolean;
}
