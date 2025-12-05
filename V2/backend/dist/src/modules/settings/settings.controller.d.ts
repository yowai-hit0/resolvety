import { SettingsService } from './settings.service';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
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
    updateSettings(settings: any, req: any): Promise<any>;
}
