import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AppsService } from './apps.service';
import { CreateAppDto, UpdateAppDto, CreateApiKeyDto, CreateIpWhitelistDto, UpdateIpWhitelistDto } from './dto/app.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Apps')
@Controller('apps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin')
@ApiBearerAuth()
export class AppsController {
  constructor(private appsService: AppsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all apps', description: 'Retrieve a paginated list of apps. Optionally filter by organization.' })
  @ApiQuery({ name: 'organization_id', required: false, type: String, description: 'Filter by organization UUID' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to return (pagination)' })
  @ApiResponse({ status: 200, description: 'List of apps retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('organization_id') organizationId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.appsService.findAll(
      organizationId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get app by ID', description: 'Retrieve detailed information about a specific app including API keys and IP whitelist. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String, description: 'App UUID' })
  @ApiResponse({ status: 200, description: 'App details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async findOne(@Param('id') id: string) {
    return this.appsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new app', description: 'Create a new application for API integration. Requires super_admin or admin role.' })
  @ApiResponse({ status: 201, description: 'App created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async create(@Body() dto: CreateAppDto, @Request() req) {
    return this.appsService.create(dto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update app', description: 'Update an existing app. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'App updated successfully' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async update(@Param('id') id: string, @Body() dto: UpdateAppDto, @Request() req) {
    return this.appsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete app', description: 'Delete an app. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'App deleted successfully' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async delete(@Param('id') id: string) {
    return this.appsService.delete(id);
  }

  // API Key Management
  @Post(':id/api-keys')
  @ApiOperation({ 
    summary: 'Create API key for app', 
    description: 'Generate a new API key for the app. The key will only be shown once - store it securely! Requires super_admin or admin role.' 
  })
  @ApiParam({ name: 'id', type: String, description: 'App UUID' })
  @ApiResponse({ 
    status: 201, 
    description: 'API key created successfully. The key is returned only once - store it securely!' 
  })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async createApiKey(@Param('id') id: string, @Body() dto: CreateApiKeyDto, @Request() req) {
    return this.appsService.createApiKey(id, dto, req.user.id);
  }

  @Get(':id/api-keys')
  @ApiOperation({ summary: 'Get all API keys for app', description: 'List all API keys for an app (shows key prefix, not full key). Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'List of API keys retrieved successfully' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async getApiKeys(@Param('id') id: string) {
    return this.appsService.getApiKeys(id);
  }

  @Delete(':id/api-keys/:keyId')
  @ApiOperation({ summary: 'Revoke API key', description: 'Deactivate an API key. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'keyId', type: String })
  @ApiResponse({ status: 200, description: 'API key revoked successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async revokeApiKey(@Param('id') id: string, @Param('keyId') keyId: string) {
    return this.appsService.revokeApiKey(id, keyId);
  }

  // IP Whitelist Management
  @Post(':id/ip-whitelist')
  @ApiOperation({ summary: 'Add IP to whitelist', description: 'Add an IP address or CIDR range to the app\'s whitelist. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'IP added to whitelist successfully' })
  @ApiResponse({ status: 400, description: 'Invalid IP address format' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 409, description: 'IP address already in whitelist' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async addIpToWhitelist(@Param('id') id: string, @Body() dto: CreateIpWhitelistDto, @Request() req) {
    return this.appsService.addIpToWhitelist(id, dto, req.user.id);
  }

  @Get(':id/ip-whitelist')
  @ApiOperation({ summary: 'Get IP whitelist for app', description: 'Retrieve all IP addresses in the app\'s whitelist. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'IP whitelist retrieved successfully' })
  @ApiResponse({ status: 404, description: 'App not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async getIpWhitelist(@Param('id') id: string) {
    return this.appsService.getIpWhitelist(id);
  }

  @Put(':id/ip-whitelist/:ipId')
  @ApiOperation({ summary: 'Update IP whitelist entry', description: 'Update an existing IP whitelist entry. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'ipId', type: String })
  @ApiResponse({ status: 200, description: 'IP whitelist entry updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid IP address format' })
  @ApiResponse({ status: 404, description: 'IP whitelist entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async updateIpWhitelist(@Param('id') id: string, @Param('ipId') ipId: string, @Body() dto: UpdateIpWhitelistDto) {
    return this.appsService.updateIpWhitelist(id, ipId, dto);
  }

  @Delete(':id/ip-whitelist/:ipId')
  @ApiOperation({ summary: 'Remove IP from whitelist', description: 'Remove an IP address from the app\'s whitelist. Requires super_admin or admin role.' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'ipId', type: String })
  @ApiResponse({ status: 200, description: 'IP removed from whitelist successfully' })
  @ApiResponse({ status: 404, description: 'IP whitelist entry not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires super_admin or admin role' })
  async removeIpFromWhitelist(@Param('id') id: string, @Param('ipId') ipId: string) {
    return this.appsService.removeIpFromWhitelist(id, ipId);
  }
}

