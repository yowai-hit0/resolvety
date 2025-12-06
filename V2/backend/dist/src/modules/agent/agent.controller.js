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
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_service_1 = require("./agent.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const agent_dto_1 = require("./dto/agent.dto");
let AgentController = class AgentController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getDashboard(req) {
        return this.agentService.getDashboard(req.user.id);
    }
    async getTickets(req, skip, take, status, priority, search, sortBy, sortOrder) {
        return this.agentService.getTickets(req.user.id, skip ? parseInt(skip) : 0, take ? parseInt(take) : 10, status, priority, search, sortBy, sortOrder || 'desc');
    }
    async updateTicketStatus(id, dto, req) {
        return this.agentService.updateTicketStatus(id, dto.status, req.user.id);
    }
    async updateTicketPriority(id, dto, req) {
        return this.agentService.updateTicketPriority(id, dto.priority_id, req.user.id);
    }
    async getPerformance(req) {
        return this.agentService.getPerformance(req.user.id);
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent dashboard data' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('tickets'),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent assigned tickets' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number, example: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, enum: ['New', 'Assigned', 'In_Progress', 'Resolved', 'Closed'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search in ticket code, subject, description, requester' }),
    (0, swagger_1.ApiQuery)({ name: 'sort_by', required: false, type: String, enum: ['ticket_code', 'subject', 'status', 'priority', 'created_at', 'updated_at'] }),
    (0, swagger_1.ApiQuery)({ name: 'sort_order', required: false, type: String, enum: ['asc', 'desc'], example: 'desc' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('priority')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('sort_by')),
    __param(7, (0, common_1.Query)('sort_order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Put)('tickets/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket status' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: agent_dto_1.UpdateTicketStatusDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, agent_dto_1.UpdateTicketStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateTicketStatus", null);
__decorate([
    (0, common_1.Put)('tickets/:id/priority'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket priority' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: agent_dto_1.UpdateTicketPriorityDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, agent_dto_1.UpdateTicketPriorityDto, Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateTicketPriority", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get agent performance metrics' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getPerformance", null);
exports.AgentController = AgentController = __decorate([
    (0, swagger_1.ApiTags)('Agent'),
    (0, common_1.Controller)('agent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map