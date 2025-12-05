import { PrismaService } from '../../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        system: {
            name: string;
            version: string;
        };
        features: {
            email_notifications: boolean;
            sms_notifications: boolean;
            two_factor_auth: boolean;
        };
    }>;
    updateSettings(settings: any, userId: string): Promise<any>;
}
