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
exports.PublicApiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_api_service_1 = require("./public-api.service");
const public_api_dto_1 = require("./dto/public-api.dto");
const api_key_guard_1 = require("../apps/guards/api-key.guard");
let PublicApiController = class PublicApiController {
    constructor(publicApiService) {
        this.publicApiService = publicApiService;
    }
    async registerUser(dto, req) {
        return this.publicApiService.registerUser(dto, req.app);
    }
    async createTicket(dto, req) {
        return this.publicApiService.createTicket(dto, req.app);
    }
    async getUserTickets(userId, status, skip, take, req) {
        return this.publicApiService.getUserTickets(req.app, userId, status, skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
    }
    async getUserTicket(ticketId, userId, req) {
        return this.publicApiService.getUserTicket(ticketId, req.app, userId);
    }
    async getCategories(req) {
        return this.publicApiService.getCategories(req.app);
    }
    async getPriorities(req) {
        return this.publicApiService.getPriorities(req.app);
    }
    async getUserProfile(phone, req) {
        return this.publicApiService.getUserProfile(req.app, phone);
    }
};
exports.PublicApiController = PublicApiController;
__decorate([
    (0, common_1.Post)('users/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Register a new user via API',
        description: 'Register a new user in the organization associated with the API key. The user will be assigned the "customer" role by default.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data or user already exists' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_api_dto_1.ApiRegisterUserDto, Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('tickets'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new ticket via API',
        description: 'Create a new support ticket in the organization associated with the API key. Use the user_id obtained from GET /api/v1/users/profile. The ticket will be created by the specified user.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ticket created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data, user does not belong to organization, or user is not active' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User or priority not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [public_api_dto_1.ApiCreateTicketDto, Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('tickets'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user tickets via API',
        description: 'Retrieve tickets for a user (tickets they created or are assigned to) with all details including comments, attachments, and events. Use the user_id obtained from GET /api/v1/users/profile endpoint. User must belong to the app\'s organization.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiQuery)({ name: 'user_id', required: true, type: String, description: 'User UUID (obtained from GET /api/v1/users/profile)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, enum: ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Resolved', 'Closed', 'Reopened'], description: 'Filter by ticket status' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)', example: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: Number, description: 'Number of records to return (pagination)', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User tickets retrieved successfully with all details' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data, user_id required, or user does not belong to organization' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Query)('user_id')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('skip')),
    __param(3, (0, common_1.Query)('take')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "getUserTickets", null);
__decorate([
    (0, common_1.Get)('tickets/:ticketId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific user ticket via API',
        description: 'Retrieve a specific ticket with all details (comments, attachments, events) for a user. Use the user_id obtained from GET /api/v1/users/profile endpoint. User must have created or be assigned to the ticket.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiParam)({ name: 'ticketId', type: String, description: 'Ticket UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'user_id', required: true, type: String, description: 'User UUID (obtained from GET /api/v1/users/profile)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data, user_id required, or user does not belong to organization' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User or ticket not found, or user does not have access' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Param)('ticketId')),
    __param(1, (0, common_1.Query)('user_id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "getUserTicket", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all available categories',
        description: 'Retrieve all active categories that can be used when creating tickets. Categories are used to classify and organize tickets.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Categories retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                    name: { type: 'string', example: 'Technical Support' },
                    is_active: { type: 'boolean', example: true },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('priorities'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all available priorities',
        description: 'Retrieve all active priorities that can be used when creating tickets. Priorities determine the urgency level of tickets and are required when creating a ticket.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Priorities retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                    name: { type: 'string', example: 'High' },
                    sort_order: { type: 'number', example: 1 },
                    is_active: { type: 'boolean', example: true },
                    created_at: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "getPriorities", null);
__decorate([
    (0, common_1.Get)('users/profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user profile',
        description: 'Retrieve a user profile by phone number. This allows you to check if a user is registered in the organization before creating tickets. Returns the user profile including user ID. User must belong to the app\'s organization.'
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' }),
    (0, swagger_1.ApiQuery)({ name: 'phone', required: true, type: String, description: 'User phone number (required)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000', description: 'User UUID - use this for subsequent API calls' },
                email: { type: 'string', example: 'user@example.com' },
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'customer' },
                organization_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174001' },
                is_active: { type: 'boolean', example: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data, phone number required, or user does not belong to organization' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found for this phone number' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or missing API key' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'IP address not whitelisted' }),
    __param(0, (0, common_1.Query)('phone')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PublicApiController.prototype, "getUserProfile", null);
exports.PublicApiController = PublicApiController = __decorate([
    (0, swagger_1.ApiTags)('Public API'),
    (0, common_1.Controller)('v1'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __metadata("design:paramtypes", [public_api_service_1.PublicApiService])
], PublicApiController);
//# sourceMappingURL=public-api.controller.js.map