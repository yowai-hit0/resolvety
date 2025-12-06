import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppDto, UpdateAppDto, CreateApiKeyDto, CreateIpWhitelistDto, UpdateIpWhitelistDto } from './dto/app.dto';
export declare class AppsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId?: string, skip?: number, take?: number): Promise<{
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
    create(dto: CreateAppDto, userId: string): Promise<{
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
    update(id: string, dto: UpdateAppDto, userId: string): Promise<{
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
    createApiKey(appId: string, dto: CreateApiKeyDto, userId: string): Promise<{
        api_key: string;
        key_prefix: string;
        name: string;
        expires_at: Date;
        message: string;
    }>;
    revokeApiKey(appId: string, keyId: string): Promise<{
        message: string;
    }>;
    getApiKeys(appId: string): Promise<{
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
    addIpToWhitelist(appId: string, dto: CreateIpWhitelistDto, userId: string): Promise<{
        id: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        created_by_id: string | null;
        app_id: string;
        ip_address: string;
    }>;
    updateIpWhitelist(appId: string, ipId: string, dto: UpdateIpWhitelistDto): Promise<{
        id: string;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        created_by_id: string | null;
        app_id: string;
        ip_address: string;
    }>;
    removeIpFromWhitelist(appId: string, ipId: string): Promise<{
        message: string;
    }>;
    getIpWhitelist(appId: string): Promise<({
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
    private isValidIpOrCidr;
    verifyApiKey(apiKey: string, clientIp: string): Promise<{
        app: any;
        apiKeyRecord: any;
    }>;
    private isIpInWhitelist;
    private isIpInCidr;
}
