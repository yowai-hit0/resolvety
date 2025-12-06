import { Controller, Get, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PublicApiService } from './public-api.service';
import { ApiRegisterUserDto, ApiCreateTicketDto } from './dto/public-api.dto';
import { ApiKeyGuard } from '../apps/guards/api-key.guard';

@ApiTags('Public API')
@Controller('v1')
@UseGuards(ApiKeyGuard)
export class PublicApiController {
  constructor(private publicApiService: PublicApiService) {}

  @Post('users/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user via API', 
    description: 'Register a new user in the organization associated with the API key. The user will be assigned the "customer" role by default.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or user already exists' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async registerUser(@Body() dto: ApiRegisterUserDto, @Request() req) {
    // App is attached to request by ApiKeyGuard
    return this.publicApiService.registerUser(dto, req.app);
  }

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new ticket via API', 
    description: 'Create a new support ticket in the organization associated with the API key. Use the user_id obtained from GET /api/v1/users/profile. The ticket will be created by the specified user.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data, user does not belong to organization, or user is not active' })
  @ApiResponse({ status: 404, description: 'User or priority not found' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async createTicket(@Body() dto: ApiCreateTicketDto, @Request() req) {
    // App is attached to request by ApiKeyGuard
    return this.publicApiService.createTicket(dto, req.app);
  }

  @Get('tickets')
  @ApiOperation({ 
    summary: 'Get user tickets via API', 
    description: 'Retrieve tickets for a user (tickets they created or are assigned to) with all details including comments, attachments, and events. Use the user_id obtained from GET /api/v1/users/profile endpoint. User must belong to the app\'s organization.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiQuery({ name: 'user_id', required: true, type: String, description: 'User UUID (obtained from GET /api/v1/users/profile)' })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['New', 'Assigned', 'In_Progress', 'On_Hold', 'Resolved', 'Closed', 'Reopened'], description: 'Filter by ticket status' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of records to skip (pagination)', example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of records to return (pagination)', example: 10 })
  @ApiResponse({ status: 200, description: 'User tickets retrieved successfully with all details' })
  @ApiResponse({ status: 400, description: 'Invalid input data, user_id required, or user does not belong to organization' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async getUserTickets(
    @Query('user_id') userId: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Request() req?: any,
  ) {
    return this.publicApiService.getUserTickets(
      req.app,
      userId,
      status,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get('tickets/:ticketId')
  @ApiOperation({ 
    summary: 'Get a specific user ticket via API', 
    description: 'Retrieve a specific ticket with all details (comments, attachments, events) for a user. Use the user_id obtained from GET /api/v1/users/profile endpoint. User must have created or be assigned to the ticket.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiParam({ name: 'ticketId', type: String, description: 'Ticket UUID' })
  @ApiQuery({ name: 'user_id', required: true, type: String, description: 'User UUID (obtained from GET /api/v1/users/profile)' })
  @ApiResponse({ status: 200, description: 'Ticket details retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data, user_id required, or user does not belong to organization' })
  @ApiResponse({ status: 404, description: 'User or ticket not found, or user does not have access' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async getUserTicket(
    @Param('ticketId') ticketId: string,
    @Query('user_id') userId: string,
    @Request() req?: any,
  ) {
    return this.publicApiService.getUserTicket(ticketId, req.app, userId);
  }

  @Get('categories')
  @ApiOperation({ 
    summary: 'Get all available categories', 
    description: 'Retrieve all active categories that can be used when creating tickets. Categories are used to classify and organize tickets.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async getCategories(@Request() req) {
    return this.publicApiService.getCategories(req.app);
  }

  @Get('priorities')
  @ApiOperation({ 
    summary: 'Get all available priorities', 
    description: 'Retrieve all active priorities that can be used when creating tickets. Priorities determine the urgency level of tickets and are required when creating a ticket.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async getPriorities(@Request() req) {
    return this.publicApiService.getPriorities(req.app);
  }

  @Get('users/profile')
  @ApiOperation({ 
    summary: 'Get user profile', 
    description: 'Retrieve a user profile by phone number. This allows you to check if a user is registered in the organization before creating tickets. Returns the user profile including user ID. User must belong to the app\'s organization.' 
  })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key for authentication (can also use Authorization: Bearer <key>)' })
  @ApiQuery({ name: 'phone', required: true, type: String, description: 'User phone number (required)' })
  @ApiResponse({ 
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
  })
  @ApiResponse({ status: 400, description: 'Invalid input data, phone number required, or user does not belong to organization' })
  @ApiResponse({ status: 404, description: 'User not found for this phone number' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 403, description: 'IP address not whitelisted' })
  async getUserProfile(
    @Query('phone') phone: string,
    @Request() req?: any,
  ) {
    return this.publicApiService.getUserProfile(req.app, phone);
  }
}

