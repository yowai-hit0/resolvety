"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
let AppsService = class AppsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, skip = 0, take = 10) {
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('App not found');
        }
        return app;
    }
    async create(dto, userId) {
        const organization = await this.prisma.organization.findUnique({
            where: { id: dto.organization_id },
        });
        if (!organization) {
            throw new common_1.NotFoundException('Organization not found');
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
    async update(id, dto, userId) {
        const app = await this.prisma.app.findUnique({ where: { id } });
        if (!app) {
            throw new common_1.NotFoundException('App not found');
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
    async delete(id) {
        const app = await this.prisma.app.findUnique({ where: { id } });
        if (!app) {
            throw new common_1.NotFoundException('App not found');
        }
        await this.prisma.app.delete({
            where: { id },
        });
        return { message: 'App deleted successfully' };
    }
    async createApiKey(appId, dto, userId) {
        const app = await this.prisma.app.findUnique({ where: { id: appId } });
        if (!app) {
            throw new common_1.NotFoundException('App not found');
        }
        const randomBytes = crypto.randomBytes(32);
        const apiKey = `rsk_${randomBytes.toString('base64url')}`;
        const keyPrefix = apiKey.substring(0, 8);
        const keyHash = await bcrypt.hash(apiKey, 10);
        let expiresAt = null;
        if (dto.expires_at) {
            expiresAt = new Date(dto.expires_at);
            if (isNaN(expiresAt.getTime())) {
                throw new common_1.BadRequestException('Invalid expires_at date format');
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
        return {
            api_key: apiKey,
            key_prefix: keyPrefix,
            name: dto.name,
            expires_at: expiresAt,
            message: 'Store this API key securely. It will not be shown again.',
        };
    }
    async revokeApiKey(appId, keyId) {
        const apiKey = await this.prisma.appApiKey.findFirst({
            where: {
                id: keyId,
                app_id: appId,
            },
        });
        if (!apiKey) {
            throw new common_1.NotFoundException('API key not found');
        }
        await this.prisma.appApiKey.update({
            where: { id: keyId },
            data: { is_active: false },
        });
        return { message: 'API key revoked successfully' };
    }
    async getApiKeys(appId) {
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
    async addIpToWhitelist(appId, dto, userId) {
        const app = await this.prisma.app.findUnique({ where: { id: appId } });
        if (!app) {
            throw new common_1.NotFoundException('App not found');
        }
        if (!this.isValidIpOrCidr(dto.ip_address)) {
            throw new common_1.BadRequestException('Invalid IP address or CIDR format');
        }
        const existing = await this.prisma.appIpWhitelist.findFirst({
            where: {
                app_id: appId,
                ip_address: dto.ip_address,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('IP address already in whitelist');
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
    async updateIpWhitelist(appId, ipId, dto) {
        const entry = await this.prisma.appIpWhitelist.findFirst({
            where: {
                id: ipId,
                app_id: appId,
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('IP whitelist entry not found');
        }
        if (dto.ip_address && !this.isValidIpOrCidr(dto.ip_address)) {
            throw new common_1.BadRequestException('Invalid IP address or CIDR format');
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
    async removeIpFromWhitelist(appId, ipId) {
        const entry = await this.prisma.appIpWhitelist.findFirst({
            where: {
                id: ipId,
                app_id: appId,
            },
        });
        if (!entry) {
            throw new common_1.NotFoundException('IP whitelist entry not found');
        }
        await this.prisma.appIpWhitelist.delete({
            where: { id: ipId },
        });
        return { message: 'IP address removed from whitelist' };
    }
    async getIpWhitelist(appId) {
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
    isValidIpOrCidr(ip) {
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(\/\d{1,3})?$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
    async verifyApiKey(apiKey, clientIp) {
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
        for (const keyRecord of apiKeys) {
            const isValid = await bcrypt.compare(apiKey, keyRecord.key_hash);
            if (isValid) {
                if (!keyRecord.app.is_active) {
                    throw new common_1.BadRequestException('App is not active');
                }
                if (keyRecord.app.ip_whitelist.length > 0) {
                    const isIpAllowed = this.isIpInWhitelist(clientIp, keyRecord.app.ip_whitelist.map(w => w.ip_address));
                    if (!isIpAllowed) {
                        throw new common_1.BadRequestException('IP address not whitelisted');
                    }
                }
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
        throw new common_1.BadRequestException('Invalid API key');
    }
    isIpInWhitelist(clientIp, whitelist) {
        for (const allowedIp of whitelist) {
            if (allowedIp.includes('/')) {
                const [network, prefix] = allowedIp.split('/');
                if (this.isIpInCidr(clientIp, network, parseInt(prefix))) {
                    return true;
                }
            }
            else {
                if (clientIp === allowedIp) {
                    return true;
                }
            }
        }
        return false;
    }
    isIpInCidr(ip, network, prefix) {
        const ipParts = ip.split('.').map(Number);
        const networkParts = network.split('.').map(Number);
        if (ipParts.length !== 4 || networkParts.length !== 4) {
            return false;
        }
        const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
        const networkNum = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];
        return (ipNum & mask) === (networkNum & mask);
    }
};
exports.AppsService = AppsService;
exports.AppsService = AppsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppsService);
//# sourceMappingURL=apps.service.js.map