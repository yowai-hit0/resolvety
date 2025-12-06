import { SettingsService } from './settings.service';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        general: {
            systemName: string;
            systemDomain: string;
            supportEmail: string;
            timezone: string;
            dateFormat: string;
            timeFormat: string;
        };
        email: {
            smtpHost: string;
            smtpPort: string;
            smtpUser: string;
            smtpPassword: string;
            smtpFromEmail: string;
            smtpFromName: string;
            smtpSecure: boolean;
        };
        security: {
            passwordMinLength: number;
            passwordRequireUppercase: boolean;
            passwordRequireLowercase: boolean;
            passwordRequireNumbers: boolean;
            passwordRequireSpecial: boolean;
            sessionTimeout: number;
            maxLoginAttempts: number;
            lockoutDuration: number;
        };
        tickets: {
            defaultPriority: string;
            autoAssignEnabled: boolean;
            autoAssignStrategy: string;
            slaEnabled: boolean;
            slaResponseTime: number;
            slaResolutionTime: number;
            allowCustomerReopen: boolean;
        };
        fileUpload: {
            maxFileSize: number;
            allowedImageTypes: string;
            allowedAudioTypes: string;
            allowedVideoTypes: string;
            allowedDocumentTypes: string;
        };
        notifications: {
            emailNotifications: boolean;
            ticketCreated: boolean;
            ticketAssigned: boolean;
            ticketStatusChanged: boolean;
            ticketResolved: boolean;
            newComment: boolean;
            mentionNotifications: boolean;
        };
        organization: {
            allowMultipleOrganizations: boolean;
            defaultOrganization: string;
            organizationIsolation: boolean;
        };
    }>;
    updateSettings(settings: any, req: any): Promise<any>;
}
