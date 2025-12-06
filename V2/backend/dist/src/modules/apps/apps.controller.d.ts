import { AppsService } from './apps.service';
import { CreateAppDto, UpdateAppDto, CreateApiKeyDto, CreateIpWhitelistDto, UpdateIpWhitelistDto } from './dto/app.dto';
export declare class AppsController {
    private appsService;
    constructor(appsService: AppsService);
    findAll(organizationId?: string, skip?: string, take?: string): Promise<{
        data: ({
            organization: {
                id: string;
                name: string;
            };
            created_by: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
            _count: {
                api_keys: number;
                ip_whitelist: number;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            organization_id: string;
            is_active: boolean;
            created_at: Date;
            updated_at: Date;
            created_by_id: string | null;
            updated_by_id: string | null;
        })[];
        total: number;
        skip: number;
        take: number;
    }>;
    findOne(id: string): Promise<{
        organization: {
            id: string;
            name: string;
            domain: string;
        };
        created_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        updated_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        api_keys: {
            id: string;
            name: string;
            is_active: boolean;
            created_at: Date;
            key_prefix: string;
            last_used_at: Date;
            last_used_ip: string;
            expires_at: Date;
        }[];
        ip_whitelist: {
            id: string;
            description: string | null;
            is_active: boolean;
            created_at: Date;
            created_by_id: string | null;
            app_id: string;
            ip_address: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        organization_id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    create(dto: CreateAppDto, req: any): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        organization_id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    update(id: string, dto: UpdateAppDto, req: any): Promise<{
        organization: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        organization_id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        created_by_id: string | null;
        updated_by_id: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    createApiKey(id: string, dto: CreateApiKeyDto, req: any): Promise<{
        api_key: string;
        key_prefix: string;
        name: string;
        expires_at: Date;
        message: string;
    }>;
    getApiKeys(id: string): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        created_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
        key_prefix: string;
        last_used_at: Date;
        last_used_ip: string;
        expires_at: Date;
    }[]>;
    revokeApiKey(id: string, keyId: string): Promise<{
        message: string;
    }>;
    addIpToWhitelist(id: string, dto: CreateIpWhitelistDto, req: any): Promise<{
        id: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        created_by_id: string | null;
        app_id: string;
        ip_address: string;
    }>;
    getIpWhitelist(id: string): Promise<({
        created_by: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    } & {
        id: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        created_by_id: string | null;
        app_id: string;
        ip_address: string;
    })[]>;
    updateIpWhitelist(id: string, ipId: string, dto: UpdateIpWhitelistDto): Promise<{
        id: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        created_by_id: string | null;
        app_id: string;
        ip_address: string;
    }>;
    removeIpFromWhitelist(id: string, ipId: string): Promise<{
        message: string;
    }>;
}
