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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(skip = 0, take = 10, filters) {
        const where = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.priority) {
            where.priority_id = filters.priority;
        }
        if (filters?.assignee) {
            where.assignee_id = filters.assignee;
        }
        if (filters?.created_by) {
            where.created_by_id = filters.created_by;
        }
        if (filters?.updated_by) {
            where.updated_by_id = filters.updated_by;
        }
        if (filters?.category) {
            where.categories = {
                some: {
                    category_id: filters.category,
                },
            };
        }
        if (filters?.created_at_from || filters?.created_at_to) {
            where.created_at = {};
            if (filters.created_at_from) {
                where.created_at.gte = new Date(filters.created_at_from);
            }
            if (filters.created_at_to) {
                where.created_at.lte = new Date(filters.created_at_to);
            }
        }
        if (filters?.updated_at_from || filters?.updated_at_to) {
            where.updated_at = {};
            if (filters.updated_at_from) {
                where.updated_at.gte = new Date(filters.updated_at_from);
            }
            if (filters.updated_at_to) {
                where.updated_at.lte = new Date(filters.updated_at_to);
            }
        }
        if (filters?.search) {
            where.OR = [
                { ticket_code: { contains: filters.search, mode: 'insensitive' } },
                { subject: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { requester_email: { contains: filters.search, mode: 'insensitive' } },
                { requester_name: { contains: filters.search, mode: 'insensitive' } },
            ];
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
                    _count: {
                        select: {
                            comments: true,
                            attachments: true,
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
        };
    }
    async findOne(id) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
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
            throw new common_1.NotFoundException('Ticket not found');
        }
        return ticket;
    }
    async create(dto, userId) {
        const ticketCode = `RES-${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const ticket = await this.prisma.ticket.create({
            data: {
                ticket_code: ticketCode,
                subject: dto.subject,
                description: dto.description,
                requester_email: dto.requester_email,
                requester_name: dto.requester_name,
                requester_phone: dto.requester_phone,
                location: dto.location,
                priority_id: dto.priority_id,
                created_by_id: userId,
                updated_by_id: userId,
                categories: dto.category_ids ? {
                    create: dto.category_ids.map(catId => ({
                        category_id: catId,
                    })),
                } : undefined,
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
                categories: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        return ticket;
    }
    async update(id, dto, userId) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id } });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (dto.category_ids !== undefined) {
            await this.prisma.ticketCategory.deleteMany({
                where: { ticket_id: id },
            });
            if (dto.category_ids.length > 0) {
                await this.prisma.ticketCategory.createMany({
                    data: dto.category_ids.map(catId => ({
                        ticket_id: id,
                        category_id: catId,
                    })),
                });
            }
        }
        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                ...(dto.subject && { subject: dto.subject }),
                ...(dto.description && { description: dto.description }),
                ...(dto.status && { status: dto.status }),
                ...(dto.assignee_id !== undefined && { assignee_id: dto.assignee_id }),
                ...(dto.priority_id && { priority_id: dto.priority_id }),
                updated_by_id: userId,
                ...(dto.status === 'Resolved' && !ticket.resolved_at && { resolved_at: new Date() }),
                ...(dto.status === 'Closed' && !ticket.closed_at && { closed_at: new Date() }),
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
            },
        });
        return updated;
    }
    async addComment(ticketId, dto, userId) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const comment = await this.prisma.comment.create({
            data: {
                ticket_id: ticketId,
                author_id: userId,
                content: dto.content,
                is_internal: dto.is_internal || false,
            },
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
        });
        return comment;
    }
    async getStats() {
        const [total, byStatus, byPriority, recent,] = await Promise.all([
            this.prisma.ticket.count(),
            this.prisma.ticket.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.ticket.groupBy({
                by: ['priority_id'],
                _count: true,
            }),
            this.prisma.ticket.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const priorityIds = byPriority.map((p) => p.priority_id);
        const priorities = await this.prisma.ticketPriority.findMany({
            where: { id: { in: priorityIds } },
            select: { id: true, name: true },
        });
        const priorityMap = new Map(priorities.map((p) => [p.id, p.name]));
        return {
            total,
            by_status: byStatus,
            by_priority: byPriority.map((p) => ({
                priority_id: p.priority_id,
                priority_name: priorityMap.get(p.priority_id) || 'Unknown',
                _count: p._count,
            })),
            recent_7_days: recent,
        };
    }
    async bulkAssign(dto, userId) {
        const updated = await this.prisma.ticket.updateMany({
            where: {
                id: { in: dto.ticket_ids },
            },
            data: {
                assignee_id: dto.assignee_id,
                updated_by_id: userId,
            },
        });
        return { updated: updated.count };
    }
    async bulkStatus(dto, userId) {
        const updateData = {
            status: dto.status,
            updated_by_id: userId,
        };
        if (dto.status === 'Resolved') {
            updateData.resolved_at = new Date();
        }
        if (dto.status === 'Closed') {
            updateData.closed_at = new Date();
        }
        const updated = await this.prisma.ticket.updateMany({
            where: {
                id: { in: dto.ticket_ids },
            },
            data: updateData,
        });
        return { updated: updated.count };
    }
    async addAttachment(ticketId, dto, userId) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const attachment = await this.prisma.attachment.create({
            data: {
                ticket_id: ticketId,
                uploaded_by_id: userId,
                original_filename: dto.original_filename,
                stored_filename: dto.stored_filename,
                mime_type: dto.mime_type,
                size: dto.size,
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
        });
        return attachment;
    }
    async deleteAttachment(attachmentId, userId) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
        });
        if (!attachment) {
            throw new common_1.NotFoundException('Attachment not found');
        }
        await this.prisma.attachment.update({
            where: { id: attachmentId },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
                deleted_by_id: userId,
            },
        });
        return { message: 'Attachment deleted successfully' };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map