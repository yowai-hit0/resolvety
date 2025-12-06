import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppDto, UpdateAppDto, CreateApiKeyDto, CreateIpWhitelistDto, UpdateIpWhitelistDto } from './dto/app.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string, skip = 0, take = 10) {
    const where: any = {};
    if (organizationId) {
      where.organization_id = organizationId;
    }

    const [apps, total] = await Promise.all([
      this.prisma.app.findMany({
        where,
        skip,
        take,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          created_by: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          _count: {
            select: {
              api_keys: true,
              ip_whitelist: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.app.count({ where }),
    ]);

    return {
      data: apps,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const app = await this.prisma.app.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        created_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        updated_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        api_keys: {
          select: {
            id: true,
            key_prefix: true,
            name: true,
            last_used_at: true,
            last_used_ip: true,
            expires_at: true,
            is_active: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        ip_whitelist: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!app) {
      throw new NotFoundException('App not found');
    }

    return app;
  }

  async create(dto: CreateAppDto, userId: string) {
    // Verify organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: dto.organization_id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const app = await this.prisma.app.create({
      data: {
        name: dto.name,
        description: dto.description,
        organization_id: dto.organization_id,
        created_by_id: userId,
        updated_by_id: userId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return app;
  }

  async update(id: string, dto: UpdateAppDto, userId: string) {
    const app = await this.prisma.app.findUnique({ where: { id } });
    if (!app) {
      throw new NotFoundException('App not found');
    }

    const updated = await this.prisma.app.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        updated_by_id: userId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async delete(id: string) {
    const app = await this.prisma.app.findUnique({ where: { id } });
    if (!app) {
      throw new NotFoundException('App not found');
    }

    await this.prisma.app.delete({
      where: { id },
    });

    return { message: 'App deleted successfully' };
  }

  // API Key Management
  async createApiKey(appId: string, dto: CreateApiKeyDto, userId: string) {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException('App not found');
    }

    // Generate API key
    const randomBytes = crypto.randomBytes(32);
    const apiKey = `rsk_${randomBytes.toString('base64url')}`;
    const keyPrefix = apiKey.substring(0, 8); // First 8 chars for display (rsk_...)

    // Hash the API key
    const keyHash = await bcrypt.hash(apiKey, 10);

    // Parse expires_at if provided
    let expiresAt: Date | null = null;
    if (dto.expires_at) {
      expiresAt = new Date(dto.expires_at);
      if (isNaN(expiresAt.getTime())) {
        throw new BadRequestException('Invalid expires_at date format');
      }
    }

    await this.prisma.appApiKey.create({
      data: {
        app_id: appId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: dto.name,
        expires_at: expiresAt,
        created_by_id: userId,
      },
    });

    // Return the API key only once (it won't be stored in plain text)
    return {
      api_key: apiKey, // Only returned once!
      key_prefix: keyPrefix,
      name: dto.name,
      expires_at: expiresAt,
      message: 'Store this API key securely. It will not be shown again.',
    };
  }

  async revokeApiKey(appId: string, keyId: string) {
    const apiKey = await this.prisma.appApiKey.findFirst({
      where: {
        id: keyId,
        app_id: appId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.appApiKey.update({
      where: { id: keyId },
      data: { is_active: false },
    });

    return { message: 'API key revoked successfully' };
  }

  async getApiKeys(appId: string) {
    const apiKeys = await this.prisma.appApiKey.findMany({
      where: { app_id: appId },
      select: {
        id: true,
        key_prefix: true,
        name: true,
        last_used_at: true,
        last_used_ip: true,
        expires_at: true,
        is_active: true,
        created_at: true,
        created_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return apiKeys;
  }

  // IP Whitelist Management
  async addIpToWhitelist(appId: string, dto: CreateIpWhitelistDto, userId: string) {
    const app = await this.prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException('App not found');
    }

    // Validate IP address format (basic check)
    if (!this.isValidIpOrCidr(dto.ip_address)) {
      throw new BadRequestException('Invalid IP address or CIDR format');
    }

    // Check if IP already exists
    const existing = await this.prisma.appIpWhitelist.findFirst({
      where: {
        app_id: appId,
        ip_address: dto.ip_address,
      },
    });

    if (existing) {
      throw new ConflictException('IP address already in whitelist');
    }

    const whitelistEntry = await this.prisma.appIpWhitelist.create({
      data: {
        app_id: appId,
        ip_address: dto.ip_address,
        description: dto.description,
        created_by_id: userId,
      },
    });

    return whitelistEntry;
  }

  async updateIpWhitelist(appId: string, ipId: string, dto: UpdateIpWhitelistDto) {
    const entry = await this.prisma.appIpWhitelist.findFirst({
      where: {
        id: ipId,
        app_id: appId,
      },
    });

    if (!entry) {
      throw new NotFoundException('IP whitelist entry not found');
    }

    if (dto.ip_address && !this.isValidIpOrCidr(dto.ip_address)) {
      throw new BadRequestException('Invalid IP address or CIDR format');
    }

    const updated = await this.prisma.appIpWhitelist.update({
      where: { id: ipId },
      data: {
        ...(dto.ip_address && { ip_address: dto.ip_address }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });

    return updated;
  }

  async removeIpFromWhitelist(appId: string, ipId: string) {
    const entry = await this.prisma.appIpWhitelist.findFirst({
      where: {
        id: ipId,
        app_id: appId,
      },
    });

    if (!entry) {
      throw new NotFoundException('IP whitelist entry not found');
    }

    await this.prisma.appIpWhitelist.delete({
      where: { id: ipId },
    });

    return { message: 'IP address removed from whitelist' };
  }

  async getIpWhitelist(appId: string) {
    const whitelist = await this.prisma.appIpWhitelist.findMany({
      where: { app_id: appId },
      include: {
        created_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return whitelist;
  }

  // Helper method to validate IP or CIDR
  private isValidIpOrCidr(ip: string): boolean {
    // Basic validation - can be enhanced
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(\/\d{1,3})?$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  // Verify API key and check IP whitelist
  async verifyApiKey(apiKey: string, clientIp: string): Promise<{ app: any; apiKeyRecord: any }> {
    // Get all active API keys
    const apiKeys = await this.prisma.appApiKey.findMany({
      where: {
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } },
        ],
      },
      include: {
        app: {
          include: {
            organization: true,
            ip_whitelist: {
              where: {
                is_active: true,
              },
            },
          },
        },
      },
    });

    // Try to match the API key
    for (const keyRecord of apiKeys) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.key_hash);
      if (isValid) {
        // Check if app is active
        if (!keyRecord.app.is_active) {
          throw new BadRequestException('App is not active');
        }

        // Check IP whitelist
        if (keyRecord.app.ip_whitelist.length > 0) {
          const whitelistIps = keyRecord.app.ip_whitelist.map(w => w.ip_address);
          const isIpAllowed = this.isIpInWhitelist(clientIp, whitelistIps);
          if (!isIpAllowed) {
            throw new BadRequestException('IP address not whitelisted');
          }
        }

        // Update last used
        await this.prisma.appApiKey.update({
          where: { id: keyRecord.id },
          data: {
            last_used_at: new Date(),
            last_used_ip: clientIp,
          },
        });

        return {
          app: keyRecord.app,
          apiKeyRecord: keyRecord,
        };
      }
    }

    throw new BadRequestException('Invalid API key');
  }

  // Helper method to check if IP is in whitelist
  private isIpInWhitelist(clientIp: string, whitelist: string[]): boolean {
    for (const allowedIp of whitelist) {
      try {
        if (allowedIp.includes('/')) {
          // CIDR notation
          const [network, prefix] = allowedIp.split('/');
          const prefixNum = parseInt(prefix, 10);
          
          if (isNaN(prefixNum)) {
            continue; // Skip invalid CIDR
          }
          
          if (this.isIpInCidr(clientIp, network, prefixNum)) {
            return true;
          }
        } else {
          // Exact match
          if (clientIp === allowedIp) {
            return true;
          }
        }
      } catch (error) {
        // Skip invalid entries and continue checking
        continue;
      }
    }
    return false;
  }

  // Helper method for CIDR matching (simplified - IPv4 only)
  private isIpInCidr(ip: string, network: string, prefix: number): boolean {
    try {
      // Handle IPv6 localhost (::1) - convert to IPv4 localhost
      if (ip === '::1') {
        ip = '127.0.0.1';
      }
      
      // Handle IPv4-mapped IPv6 addresses (::ffff:127.0.0.1 -> 127.0.0.1)
      if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
      }
      
      // Only handle IPv4 addresses for now
      const ipParts = ip.split('.');
      const networkParts = network.split('.');
      
      // Check if both are IPv4
      if (ipParts.length !== 4 || networkParts.length !== 4) {
        return false;
      }
      
      // Validate prefix range
      if (prefix < 0 || prefix > 32) {
        return false;
      }
      
      const ipNums = ipParts.map(Number);
      const networkNums = networkParts.map(Number);
      
      // Validate all parts are valid numbers
      if (ipNums.some(n => isNaN(n) || n < 0 || n > 255) || 
          networkNums.some(n => isNaN(n) || n < 0 || n > 255)) {
        return false;
      }

      const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
      const ipNum = (ipNums[0] << 24) + (ipNums[1] << 16) + (ipNums[2] << 8) + ipNums[3];
      const networkNum = (networkNums[0] << 24) + (networkNums[1] << 16) + (networkNums[2] << 8) + networkNums[3];

      return (ipNum & mask) === (networkNum & mask);
    } catch (error) {
      return false;
    }
  }
}

