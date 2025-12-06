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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(skip = 0, take = 10, filters) {
        const where = {};
        if (filters?.role) {
            where.role = filters.role;
        }
        if (filters?.is_active !== undefined) {
            where.is_active = filters.is_active;
        }
        if (filters?.organization) {
            where.user_organizations = {
                some: {
                    organization_id: filters.organization,
                },
            };
        }
        if (filters?.search) {
            where.OR = [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { first_name: { contains: filters.search, mode: 'insensitive' } },
                { last_name: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take,
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    is_active: true,
                    created_at: true,
                    last_login_at: true,
                    user_organizations: {
                        include: {
                            organization: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            total,
            skip,
            take,
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                is_active: true,
                organization_id: true,
                created_at: true,
                updated_at: true,
                last_login_at: true,
                last_login_ip: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user_organizations: {
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                domain: true,
                            },
                        },
                    },
                    orderBy: {
                        is_primary: 'desc',
                        created_at: 'asc',
                    },
                },
                _count: {
                    select: {
                        tickets_created: true,
                        tickets_assigned: true,
                        comments: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getMe(userId) {
        return this.findOne(userId);
    }
    async update(id, dto, updatedBy) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { organization_ids, ...updateData } = dto;
        if (organization_ids !== undefined) {
            if (organization_ids.length > 0) {
                const orgs = await this.prisma.organization.findMany({
                    where: { id: { in: organization_ids } },
                });
                if (orgs.length !== organization_ids.length) {
                    throw new common_1.NotFoundException('One or more organizations not found');
                }
            }
            await this.prisma.userOrganization.deleteMany({
                where: { user_id: id },
            });
            if (organization_ids.length > 0) {
                await this.prisma.userOrganization.createMany({
                    data: organization_ids.map((orgId, index) => ({
                        user_id: id,
                        organization_id: orgId,
                        is_primary: index === 0,
                        created_by_id: updatedBy,
                    })),
                });
            }
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                ...updateData,
                updated_by_id: updatedBy,
            },
            include: {
                user_organizations: {
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                domain: true,
                            },
                        },
                    },
                    orderBy: {
                        is_primary: 'desc',
                        created_at: 'asc',
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async updateStatus(id, dto, updatedBy) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                is_active: dto.is_active,
                updated_by_id: updatedBy,
            },
            select: {
                id: true,
                email: true,
                is_active: true,
            },
        });
    }
    async create(dto, createdBy) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const organizationIds = dto.organization_ids || (dto.organization_id ? [dto.organization_id] : []);
        if (organizationIds.length > 0) {
            const orgs = await this.prisma.organization.findMany({
                where: { id: { in: organizationIds } },
            });
            if (orgs.length !== organizationIds.length) {
                throw new common_1.NotFoundException('One or more organizations not found');
            }
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password_hash: passwordHash,
                first_name: dto.first_name,
                last_name: dto.last_name,
                role: dto.role,
                organization_id: dto.organization_id || null,
                is_active: dto.is_active !== undefined ? dto.is_active : true,
                created_by_id: createdBy,
                ...(organizationIds.length > 0 && {
                    user_organizations: {
                        create: organizationIds.map((orgId, index) => ({
                            organization_id: orgId,
                            is_primary: index === 0,
                            created_by_id: createdBy,
                        })),
                    },
                }),
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user_organizations: {
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                domain: true,
                            },
                        },
                    },
                },
            },
        });
        return user;
    }
    async getStats() {
        const [total, byRole, active, recent,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),
            this.prisma.user.count({
                where: { is_active: true },
            }),
            this.prisma.user.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        return {
            total,
            by_role: byRole,
            active,
            recent_30_days: recent,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map