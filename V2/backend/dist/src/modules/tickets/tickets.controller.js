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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tickets_service_1 = require("./tickets.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const ticket_dto_1 = require("./dto/ticket.dto");
let TicketsController = class TicketsController {
    constructor(ticketsService) {
        this.ticketsService = ticketsService;
    }
    async findAll(skip, take, status, priority, assignee, created_by, updated_by, category, search, created_at_from, created_at_to, updated_at_from, updated_at_to) {
        return this.ticketsService.findAll(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10, {
            status,
            priority,
            assignee,
            created_by,
            updated_by,
            category,
            search,
            created_at_from,
            created_at_to,
            updated_at_from,
            updated_at_to,
        });
    }
    async getStats() {
        return this.ticketsService.getStats();
    }
    async findOne(id) {
        return this.ticketsService.findOne(id);
    }
    async create(dto, req) {
        return this.ticketsService.create(dto, req.user.id);
    }
    async update(id, dto, req) {
        return this.ticketsService.update(id, dto, req.user.id);
    }
    async addComment(id, dto, req) {
        return this.ticketsService.addComment(id, dto, req.user.id);
    }
    async bulkAssign(dto, req) {
        return this.ticketsService.bulkAssign(dto, req.user.id);
    }
    async bulkStatus(dto, req) {
        return this.ticketsService.bulkStatus(dto, req.user.id);
    }
    async addAttachment(id, dto, req) {
        return this.ticketsService.addAttachment(id, dto, req.user.id);
    }
    async deleteAttachment(id, req) {
        return this.ticketsService.deleteAttachment(id, req.user.id);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tickets with pagination and filters' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number, example: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, enum: ['New', 'Assigned', 'In_Progress', 'Resolved', 'Closed'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, type: String, description: 'Priority ID' }),
    (0, swagger_1.ApiQuery)({ name: 'assignee', required: false, type: String, description: 'Assignee user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'created_by', required: false, type: String, description: 'Created by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'updated_by', required: false, type: String, description: 'Updated by user ID' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String, description: 'Category ID' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search in ticket code, subject, description, requester' }),
    (0, swagger_1.ApiQuery)({ name: 'created_at_from', required: false, type: String, description: 'Created at from date (ISO 8601)', example: '2024-01-01T00:00:00Z' }),
    (0, swagger_1.ApiQuery)({ name: 'created_at_to', required: false, type: String, description: 'Created at to date (ISO 8601)', example: '2024-12-31T23:59:59Z' }),
    (0, swagger_1.ApiQuery)({ name: 'updated_at_from', required: false, type: String, description: 'Updated at from date (ISO 8601)', example: '2024-01-01T00:00:00Z' }),
    (0, swagger_1.ApiQuery)({ name: 'updated_at_to', required: false, type: String, description: 'Updated at to date (ISO 8601)', example: '2024-12-31T23:59:59Z' }),
    __param(0, (0, common_1.Query)('skip')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('priority')),
    __param(4, (0, common_1.Query)('assignee')),
    __param(5, (0, common_1.Query)('created_by')),
    __param(6, (0, common_1.Query)('updated_by')),
    __param(7, (0, common_1.Query)('category')),
    __param(8, (0, common_1.Query)('search')),
    __param(9, (0, common_1.Query)('created_at_from')),
    __param(10, (0, common_1.Query)('created_at_to')),
    __param(11, (0, common_1.Query)('updated_at_from')),
    __param(12, (0, common_1.Query)('updated_at_to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ticket by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new ticket' }),
    (0, swagger_1.ApiBody)({ type: ticket_dto_1.CreateTicketDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ticket_dto_1.CreateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: ticket_dto_1.UpdateTicketDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ticket_dto_1.UpdateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add comment to ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: ticket_dto_1.AddCommentDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ticket_dto_1.AddCommentDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)('bulk-assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk assign tickets to user' }),
    (0, swagger_1.ApiBody)({ type: ticket_dto_1.BulkAssignDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ticket_dto_1.BulkAssignDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "bulkAssign", null);
__decorate([
    (0, common_1.Post)('bulk-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update ticket status' }),
    (0, swagger_1.ApiBody)({ type: ticket_dto_1.BulkStatusDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ticket_dto_1.BulkStatusDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "bulkStatus", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add attachment to ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: ticket_dto_1.AddAttachmentDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ticket_dto_1.AddAttachmentDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Post)('attachments/:id/delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete attachment (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "deleteAttachment", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tickets_service_1.TicketsService])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map