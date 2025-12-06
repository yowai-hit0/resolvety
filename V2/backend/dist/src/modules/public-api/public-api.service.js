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
exports.PublicApiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let PublicApiService = class PublicApiService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerUser(dto, app) {
        if (dto.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException('User with this email already exists');
            }
        }
        let userEmail = dto.email;
        if (!userEmail) {
            const phoneClean = dto.phone.replace(/\D/g, '');
            const orgName = app.organization.name.toLowerCase().replace(/\s+/g, '');
            userEmail = `user_${phoneClean}@${orgName}.api`;
            let counter = 1;
            while (await this.prisma.user.findUnique({ where: { email: userEmail } })) {
                userEmail = `user_${phoneClean}_${counter}@${orgName}.api`;
                counter++;
            }
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: userEmail,
                password_hash: passwordHash,
                first_name: dto.first_name,
                last_name: dto.last_name,
                role: 'customer',
                organization_id: app.organization_id,
                is_active: true,
                user_organizations: {
                    create: {
                        organization_id: app.organization_id,
                        is_primary: true,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                organization_id: true,
                created_at: true,
            },
        });
        return user;
    }
    async createTicket(dto, app) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.user_id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const belongsToOrg = user.organization_id === app.organization_id ||
            await this.prisma.userOrganization.findUnique({
                where: {
                    user_id_organization_id: {
                        user_id: user.id,
                        organization_id: app.organization_id,
                    },
                },
            });
        if (!belongsToOrg) {
            throw new common_1.BadRequestException('User does not belong to the app\'s organization');
        }
        if (!user.is_active) {
            throw new common_1.BadRequestException('User is not active');
        }
        const priority = await this.prisma.ticketPriority.findUnique({
            where: { id: dto.priority_id },
        });
        if (!priority) {
            throw new common_1.NotFoundException('Priority not found');
        }
        const ticketCode = `RES-${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        let requesterPhone = '';
        const recentTicket = await this.prisma.ticket.findFirst({
            where: {
                created_by_id: user.id,
            },
            orderBy: { created_at: 'desc' },
            select: { requester_phone: true },
        });
        if (recentTicket && recentTicket.requester_phone) {
            requesterPhone = recentTicket.requester_phone;
        }
        else {
            requesterPhone = 'N/A';
        }
        const ticket = await this.prisma.ticket.create({
            data: {
                ticket_code: ticketCode,
                subject: dto.subject,
                description: dto.description,
                requester_email: user.email,
                requester_name: `${user.first_name} ${user.last_name}`,
                requester_phone: requesterPhone,
                location: dto.location,
                priority_id: dto.priority_id,
                created_by_id: user.id,
                updated_by_id: user.id,
                categories: dto.category_ids ? {
                    create: dto.category_ids.map(catId => ({
                        category_id: catId,
                    })),
                } : undefined,
            },
            include: {
                priority: true,
                assignee: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                categories: {
                    include: {
                        category: true,
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
            },
        });
        return ticket;
    }
    async getUserTickets(app, userId, status, skip = 0, take = 10) {
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const belongsToOrg = user.organization_id === app.organization_id ||
            await this.prisma.userOrganization.findUnique({
                where: {
                    user_id_organization_id: {
                        user_id: user.id,
                        organization_id: app.organization_id,
                    },
                },
            });
        if (!belongsToOrg) {
            throw new common_1.BadRequestException('User does not belong to the app\'s organization');
        }
        const where = {
            OR: [
                { created_by_id: user.id },
                { assignee_id: user.id },
            ],
        };
        if (status) {
            where.status = status;
        }
        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                skip,
                take,
                include: {
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
                    assignee: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    priority: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    comments: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                },
                            },
                        },
                        orderBy: {
                            created_at: 'asc',
                        },
                    },
                    attachments: {
                        where: {
                            is_deleted: false,
                        },
                        include: {
                            uploaded_by: {
                                select: {
                                    id: true,
                                    email: true,
                                    first_name: true,
                                    last_name: true,
                                },
                            },
                        },
                    },
                    ticket_events: {
                        include: {
                            user: {
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
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            }),
            this.prisma.ticket.count({ where }),
        ]);
        return {
            data: tickets,
            total,
            skip,
            take,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        };
    }
    async getUserTicket(ticketId, app, userId) {
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.organization_id !== app.organization_id) {
            throw new common_1.BadRequestException('User does not belong to the app\'s organization');
        }
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id: ticketId,
                OR: [
                    { created_by_id: user.id },
                    { assignee_id: user.id },
                ],
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
                updated_by: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                priority: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                email: true,
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: 'asc',
                    },
                },
                attachments: {
                    where: {
                        is_deleted: false,
                    },
                    include: {
                        uploaded_by: {
                            select: {
                                id: true,
                                email: true,
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
                ticket_events: {
                    include: {
                        user: {
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
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found or user does not have access to this ticket');
        }
        return ticket;
    }
    async getCategories(app) {
        return this.prisma.category.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                is_active: true,
                created_at: true,
            },
        });
    }
    async getPriorities(app) {
        return this.prisma.ticketPriority.findMany({
            where: { is_active: true },
            orderBy: { sort_order: 'asc' },
            select: {
                id: true,
                name: true,
                sort_order: true,
                is_active: true,
                created_at: true,
            },
        });
    }
    async getUserProfile(app, phone) {
        if (!phone) {
            throw new common_1.BadRequestException('Phone number is required');
        }
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                requester_phone: phone,
            },
            orderBy: { created_at: 'desc' },
            select: { created_by_id: true },
        });
        if (!ticket || !ticket.created_by_id) {
            throw new common_1.NotFoundException('User not found for this phone number');
        }
        const userOrg = await this.prisma.userOrganization.findUnique({
            where: {
                user_id_organization_id: {
                    user_id: ticket.created_by_id,
                    organization_id: app.organization_id,
                },
            },
        });
        const user = await this.prisma.user.findFirst({
            where: {
                id: ticket.created_by_id,
                OR: [
                    { organization_id: app.organization_id },
                    { user_organizations: { some: { organization_id: app.organization_id } } },
                ],
                is_active: true,
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                organization_id: true,
                is_active: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found in this organization');
        }
        return user;
    }
};
exports.PublicApiService = PublicApiService;
exports.PublicApiService = PublicApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicApiService);
//# sourceMappingURL=public-api.service.js.map