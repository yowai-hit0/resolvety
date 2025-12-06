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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrganizationsService = class OrganizationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(skip = 0, take = 10) {
        const [organizations, total] = await Promise.all([
            this.prisma.organization.findMany({
                skip,
                take,
                include: {
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.organization.count(),
        ]);
        return { data: organizations, total, skip, take };
    }
    async findOne(id) {
        const org = await this.prisma.organization.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        role: true,
                        is_active: true,
                    },
                },
                user_organizations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                first_name: true,
                                last_name: true,
                                role: true,
                                is_active: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        users: true,
                        user_organizations: true,
                    },
                },
            },
        });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return org;
    }
    async create(name, userId, domain, email, phone, address) {
        return this.prisma.organization.create({
            data: {
                name,
                domain,
                email,
                phone,
                address,
                created_by_id: userId,
                updated_by_id: userId,
            },
        });
    }
    async update(id, data, userId) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return this.prisma.organization.update({
            where: { id },
            data: {
                ...data,
                updated_by_id: userId,
            },
        });
    }
    async delete(id, userId) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        return this.prisma.organization.update({
            where: { id },
            data: {
                is_active: false,
                updated_by_id: userId,
            },
        });
    }
    async getUsers(id) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const userOrgs = await this.prisma.userOrganization.findMany({
            where: { organization_id: id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        role: true,
                        is_active: true,
                    },
                },
            },
        });
        return userOrgs.map(uo => ({
            ...uo.user,
            is_primary: uo.is_primary,
        }));
    }
    async getTickets(id) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org) {
            throw new common_1.NotFoundException('Organization not found');
        }
        const userOrgs = await this.prisma.userOrganization.findMany({
            where: { organization_id: id },
            select: { user_id: true },
        });
        const userIds = userOrgs.map(uo => uo.user_id);
        return this.prisma.ticket.findMany({
            where: {
                created_by_id: { in: userIds },
            },
            include: {
                created_by: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                priority: true,
            },
        });
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map