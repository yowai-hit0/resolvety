"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        return {
            general: {
                systemName: 'ResolveIt',
                systemDomain: 'resolveit.rw',
                supportEmail: 'support@resolveit.rw',
                timezone: 'Africa/Kigali',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
            },
            email: {
                smtpHost: '',
                smtpPort: '587',
                smtpUser: '',
                smtpPassword: '',
                smtpFromEmail: 'noreply@resolveit.rw',
                smtpFromName: 'ResolveIt',
                smtpSecure: false,
            },
            security: {
                passwordMinLength: 8,
                passwordRequireUppercase: true,
                passwordRequireLowercase: true,
                passwordRequireNumbers: true,
                passwordRequireSpecial: false,
                sessionTimeout: 24,
                maxLoginAttempts: 5,
                lockoutDuration: 30,
            },
            tickets: {
                defaultPriority: 'Medium',
                autoAssignEnabled: false,
                autoAssignStrategy: 'round-robin',
                slaEnabled: false,
                slaResponseTime: 4,
                slaResolutionTime: 24,
                allowCustomerReopen: true,
            },
            fileUpload: {
                maxFileSize: 50,
                allowedImageTypes: 'jpg,jpeg,png,gif,webp',
                allowedAudioTypes: 'mp3,wav,ogg,aac,m4a',
                allowedVideoTypes: 'mp4,avi,mov,wmv,webm',
                allowedDocumentTypes: 'pdf,doc,docx,xls,xlsx,txt',
            },
            notifications: {
                emailNotifications: true,
                ticketCreated: true,
                ticketAssigned: true,
                ticketStatusChanged: true,
                ticketResolved: true,
                newComment: true,
                mentionNotifications: true,
            },
            organization: {
                allowMultipleOrganizations: true,
                defaultOrganization: '',
                organizationIsolation: true,
            },
        };
    }
    async updateSettings(settings, userId) {
        const validSections = [
            'general',
            'email',
            'security',
            'tickets',
            'fileUpload',
            'notifications',
            'organization',
        ];
        const updatedSettings = {};
        for (const section of validSections) {
            if (settings[section]) {
                updatedSettings[section] = settings[section];
            }
        }
        return {
            ...updatedSettings,
            updated_by: userId,
            updated_at: new Date(),
            message: 'Settings updated successfully',
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map