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
exports.AppsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const apps_service_1 = require("./apps.service");
const app_dto_1 = require("./dto/app.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AppsController = class AppsController {
    constructor(appsService) {
        this.appsService = appsService;
    }
    async findAll(organizationId, skip, take) {
        return this.appsService.findAll(organizationId, skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
    }
    async findOne(id) {
        return this.appsService.findOne(id);
    }
    async create(dto, req) {
        return this.appsService.create(dto, req.user.id);
    }
    async update(id, dto, req) {
        return this.appsService.update(id, dto, req.user.id);
    }
    async delete(id) {
        return this.appsService.delete(id);
    }
    async createApiKey(id, dto, req) {
        return this.appsService.createApiKey(id, dto, req.user.id);
    }
    async getApiKeys(id) {
        return this.appsService.getApiKeys(id);
    }
    async revokeApiKey(id, keyId) {
        return this.appsService.revokeApiKey(id, keyId);
    }
    async addIpToWhitelist(id, dto, req) {
        return this.appsService.addIpToWhitelist(id, dto, req.user.id);
    }
    async getIpWhitelist(id) {
        return this.appsService.getIpWhitelist(id);
    }
    async updateIpWhitelist(id, ipId, dto) {
        return this.appsService.updateIpWhitelist(id, ipId, dto);
    }
    async removeIpFromWhitelist(id, ipId) {
        return this.appsService.removeIpFromWhitelist(id, ipId);
    }
};
exports.AppsController = AppsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all apps', description: 'Retrieve a paginated list of apps. Optionally filter by organization.' }),
    (0, swagger_1.ApiQuery)({ name: 'organization_id', required: false, type: String, description: 'Filter by organization UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number, description: 'Number of records to return (pagination)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of apps retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('organization_id')),
    __param(1, (0, common_1.Query)('skip')),
    __param(2, (0, common_1.Query)('take')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get app by ID', description: 'Retrieve detailed information about a specific app including API keys and IP whitelist. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'App UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'App details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new app', description: 'Create a new application for API integration. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'App created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Organization not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [app_dto_1.CreateAppDto, Object]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update app', description: 'Update an existing app. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'App updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, app_dto_1.UpdateAppDto, Object]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete app', description: 'Delete an app. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'App deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/api-keys'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create API key for app',
        description: 'Generate a new API key for the app. The key will only be shown once - store it securely! Requires super_admin or admin role.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'App UUID' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'API key created successfully. The key is returned only once - store it securely!'
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, app_dto_1.CreateApiKeyDto, Object]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Get)(':id/api-keys'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all API keys for app', description: 'List all API keys for an app (shows key prefix, not full key). Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of API keys retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "getApiKeys", null);
__decorate([
    (0, common_1.Delete)(':id/api-keys/:keyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke API key', description: 'Deactivate an API key. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiParam)({ name: 'keyId', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API key revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'API key not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('keyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Post)(':id/ip-whitelist'),
    (0, swagger_1.ApiOperation)({ summary: 'Add IP to whitelist', description: 'Add an IP address or CIDR range to the app\'s whitelist. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'IP added to whitelist successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid IP address format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'IP address already in whitelist' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, app_dto_1.CreateIpWhitelistDto, Object]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "addIpToWhitelist", null);
__decorate([
    (0, common_1.Get)(':id/ip-whitelist'),
    (0, swagger_1.ApiOperation)({ summary: 'Get IP whitelist for app', description: 'Retrieve all IP addresses in the app\'s whitelist. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'IP whitelist retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'App not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "getIpWhitelist", null);
__decorate([
    (0, common_1.Put)(':id/ip-whitelist/:ipId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update IP whitelist entry', description: 'Update an existing IP whitelist entry. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiParam)({ name: 'ipId', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'IP whitelist entry updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid IP address format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'IP whitelist entry not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('ipId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, app_dto_1.UpdateIpWhitelistDto]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "updateIpWhitelist", null);
__decorate([
    (0, common_1.Delete)(':id/ip-whitelist/:ipId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove IP from whitelist', description: 'Remove an IP address from the app\'s whitelist. Requires super_admin or admin role.' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiParam)({ name: 'ipId', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'IP removed from whitelist successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'IP whitelist entry not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Requires super_admin or admin role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('ipId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "removeIpFromWhitelist", null);
exports.AppsController = AppsController = __decorate([
    (0, swagger_1.ApiTags)('Apps'),
    (0, common_1.Controller)('apps'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('super_admin', 'admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [apps_service_1.AppsService])
], AppsController);
//# sourceMappingURL=apps.controller.js.map