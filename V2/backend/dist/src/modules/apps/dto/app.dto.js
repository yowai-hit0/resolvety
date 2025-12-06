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
exports.UpdateIpWhitelistDto = exports.CreateIpWhitelistDto = exports.CreateApiKeyDto = exports.UpdateAppDto = exports.CreateAppDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAppDto {
}
exports.CreateAppDto = CreateAppDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Integration App', description: 'Name of the application' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAppDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'App for integrating with our external system', description: 'Optional description of the application' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID of the organization this app belongs to' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAppDto.prototype, "organization_id", void 0);
class UpdateAppDto {
}
exports.UpdateAppDto = UpdateAppDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated App Name', description: 'Updated name of the application' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description', description: 'Updated description of the application' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAppDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Whether the app is active' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAppDto.prototype, "is_active", void 0);
class CreateApiKeyDto {
}
exports.CreateApiKeyDto = CreateApiKeyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Production Key', description: 'Optional name for the API key' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-31T23:59:59Z', description: 'Optional expiration date in ISO 8601 format' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "expires_at", void 0);
class CreateIpWhitelistDto {
}
exports.CreateIpWhitelistDto = CreateIpWhitelistDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '192.168.1.100',
        description: 'IP address or CIDR notation (e.g., 192.168.1.0/24 for a subnet)'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIpWhitelistDto.prototype, "ip_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Production server', description: 'Optional description for this IP whitelist entry' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIpWhitelistDto.prototype, "description", void 0);
class UpdateIpWhitelistDto {
}
exports.UpdateIpWhitelistDto = UpdateIpWhitelistDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '192.168.1.101', description: 'Updated IP address or CIDR notation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIpWhitelistDto.prototype, "ip_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description', description: 'Updated description for this IP whitelist entry' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateIpWhitelistDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Whether this IP whitelist entry is active' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateIpWhitelistDto.prototype, "is_active", void 0);
//# sourceMappingURL=app.dto.js.map