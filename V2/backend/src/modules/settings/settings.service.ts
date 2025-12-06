import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // TODO: In the future, load from a Settings table/model
    // For now, return default structure that matches UI expectations
    // Check if there's a stored settings in a future Settings table
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

  async updateSettings(settings: any, userId: string) {
    // TODO: In the future, save to a Settings table/model
    // For now, just validate and return the settings
    // In production, this should persist to database
    
    // Validate settings structure
    const validSections = [
      'general',
      'email',
      'security',
      'tickets',
      'fileUpload',
      'notifications',
      'organization',
    ];

    const updatedSettings: any = {};
    
    // Only accept valid sections
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
}

