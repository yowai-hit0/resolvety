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
exports.InvitesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invites_service_1 = require("./invites.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
class CreateInviteDto {
}
class AcceptInviteDto {
}
let InvitesController = class InvitesController {
    constructor(invitesService) {
        this.invitesService = invitesService;
    }
    async findAll(status, email, skip, take) {
        return this.invitesService.findAll(status, email, skip ? parseInt(skip) : 0, take ? parseInt(take) : 20);
    }
    async create(dto, req) {
        return this.invitesService.create(dto.email, dto.role, dto.expiresInHours || 72, req.user.id);
    }
    async resend(id, req) {
        return this.invitesService.resend(id, req.user.id);
    }
    async revoke(id, req) {
        return this.invitesService.revoke(id, req.user.id);
    }
    async accept(dto) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        return this.invitesService.accept(dto.token, hashedPassword, dto.first_name, dto.last_name);
    }
};
exports.InvitesController = InvitesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invites (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.InviteStatus }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('skip')),
    __param(3, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvitesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invite (admin only)' }),
    (0, swagger_1.ApiBody)({ type: CreateInviteDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateInviteDto, Object]),
    __metadata("design:returntype", Promise)
], InvitesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/resend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Resend invite email (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvitesController.prototype, "resend", null);
__decorate([
    (0, common_1.Post)(':id/revoke'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke invite (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvitesController.prototype, "revoke", null);
__decorate([
    (0, common_1.Post)('accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept invite (public endpoint)' }),
    (0, swagger_1.ApiBody)({ type: AcceptInviteDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AcceptInviteDto]),
    __metadata("design:returntype", Promise)
], InvitesController.prototype, "accept", null);
exports.InvitesController = InvitesController = __decorate([
    (0, swagger_1.ApiTags)('Invites'),
    (0, common_1.Controller)('invites'),
    __metadata("design:paramtypes", [invites_service_1.InvitesService])
], InvitesController);
//# sourceMappingURL=invites.controller.js.map