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
        try {
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
            if (organizations.length === 0) {
                return {
                    data: [],
                    total,
                    skip,
                    take
                };
            }
            const validSkip = isNaN(skip) || skip < 0 ? 0 : skip;
            const validTake = isNaN(take) || take < 1 ? 10 : take;
            const orgIds = organizations.map(org => org.id);
            const userOrgs = await this.prisma.userOrganization.findMany({
                where: { organization_id: { in: orgIds } },
                select: { organization_id: true, user_id: true },
            });
            const userIdsByOrg = new Map();
            userOrgs.forEach(uo => {
                if (!userIdsByOrg.has(uo.organization_id)) {
                    userIdsByOrg.set(uo.organization_id, []);
                }
                userIdsByOrg.get(uo.organization_id).push(uo.user_id);
            });
            const organizationsWithTicketCounts = await Promise.all(organizations.map(async (org) => {
                try {
                    if (!org || !org.id) {
                        console.warn('Invalid organization object:', org);
                        return {
                            id: '',
                            name: '',
                            domain: null,
                            email: null,
                            phone: null,
                            address: null,
                            is_active: true,
                            created_at: new Date(),
                            updated_at: new Date(),
                            created_by_id: null,
                            updated_by_id: null,
                            _count: { users: 0 },
                            tickets_count: 0,
                        };
                    }
                    const userIds = userIdsByOrg.get(org.id) || [];
                    let ticketCount = 0;
                    if (userIds.length > 0) {
                        try {
                            ticketCount = await this.prisma.ticket.count({
                                where: {
                                    created_by_id: { in: userIds },
                                },
                            });
                        }
                        catch (countError) {
                            console.error(`Error counting tickets for org ${org.id}:`, countError);
                            ticketCount = 0;
                        }
                    }
                    return {
                        id: org.id,
                        name: org.name,
                        domain: org.domain,
                        email: org.email,
                        phone: org.phone,
                        address: org.address,
                        is_active: org.is_active,
                        created_at: org.created_at,
                        updated_at: org.updated_at,
                        created_by_id: org.created_by_id,
                        updated_by_id: org.updated_by_id,
                        _count: org._count,
                        tickets_count: ticketCount,
                    };
                }
                catch (error) {
                    console.error(`Error processing organization ${org?.id || 'unknown'}:`, error);
                    console.error('Error stack:', error?.stack);
                    return {
                        id: org?.id,
                        name: org?.name,
                        domain: org?.domain,
                        email: org?.email,
                        phone: org?.phone,
                        address: org?.address,
                        is_active: org?.is_active,
                        created_at: org?.created_at,
                        updated_at: org?.updated_at,
                        created_by_id: org?.created_by_id,
                        updated_by_id: org?.updated_by_id,
                        _count: org?._count,
                        tickets_count: 0,
                    };
                }
            }));
            return { data: organizationsWithTicketCounts, total, skip, take };
        }
        catch (error) {
            console.error('Error in findAll organizations:', error);
            console.error('Error stack:', error?.stack);
            console.error('Error details:', {
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
                skip,
                take,
            });
            try {
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
                return {
                    data: organizations.map(org => ({
                        id: org.id,
                        name: org.name,
                        domain: org.domain,
                        email: org.email,
                        phone: org.phone,
                        address: org.address,
                        is_active: org.is_active,
                        created_at: org.created_at,
                        updated_at: org.updated_at,
                        created_by_id: org.created_by_id,
                        updated_by_id: org.updated_by_id,
                        _count: org._count,
                        tickets_count: 0,
                    })),
                    total,
                    skip,
                    take,
                };
            }
            catch (fallbackError) {
                console.error('Error in fallback findAll:', fallbackError);
                return {
                    data: [],
                    total: 0,
                    skip,
                    take,
                };
            }
        }
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
        const userOrgs = await this.prisma.userOrganization.findMany({
            where: { organization_id: id },
            select: { user_id: true },
        });
        const userIds = userOrgs.map(uo => uo.user_id);
        const ticketCount = userIds.length > 0
            ? await this.prisma.ticket.count({
                where: {
                    created_by_id: { in: userIds },
                },
            })
            : 0;
        return {
            ...org,
            tickets_count: ticketCount,
        };
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
        const dataToUpdate = {
            updated_by_id: userId,
        };
        if (data.name !== undefined) {
            dataToUpdate.name = data.name;
        }
        if (data.domain !== undefined) {
            dataToUpdate.domain = data.domain;
        }
        if (data.email !== undefined) {
            dataToUpdate.email = data.email;
        }
        if (data.phone !== undefined) {
            dataToUpdate.phone = data.phone;
        }
        if (data.address !== undefined) {
            dataToUpdate.address = data.address;
        }
        if (data.is_active !== undefined) {
            dataToUpdate.is_active = data.is_active;
        }
        return this.prisma.organization.update({
            where: { id },
            data: dataToUpdate,
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