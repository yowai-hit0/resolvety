import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTicketDto, UpdateTicketDto, AddCommentDto, BulkAssignDto, BulkStatusDto, AddAttachmentDto } from './dto/ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tickets with pagination and filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['New', 'Assigned', 'In_Progress', 'Resolved', 'Closed'] })
  @ApiQuery({ name: 'priority', required: false, type: String, description: 'Priority ID' })
  @ApiQuery({ name: 'assignee', required: false, type: String, description: 'Assignee user ID' })
  @ApiQuery({ name: 'created_by', required: false, type: String, description: 'Created by user ID' })
  @ApiQuery({ name: 'updated_by', required: false, type: String, description: 'Updated by user ID' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in ticket code, subject, description, requester' })
  @ApiQuery({ name: 'created_at_from', required: false, type: String, description: 'Created at from date (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @ApiQuery({ name: 'created_at_to', required: false, type: String, description: 'Created at to date (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  @ApiQuery({ name: 'updated_at_from', required: false, type: String, description: 'Updated at from date (ISO 8601)', example: '2024-01-01T00:00:00Z' })
  @ApiQuery({ name: 'updated_at_to', required: false, type: String, description: 'Updated at to date (ISO 8601)', example: '2024-12-31T23:59:59Z' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignee') assignee?: string,
    @Query('created_by') created_by?: string,
    @Query('updated_by') updated_by?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('created_at_from') created_at_from?: string,
    @Query('created_at_to') created_at_to?: string,
    @Query('updated_at_from') updated_at_from?: string,
    @Query('updated_at_to') updated_at_to?: string,
  ) {
    return this.ticketsService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
      { 
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
      },
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ticket statistics' })
  async getStats() {
    return this.ticketsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiBody({ type: CreateTicketDto })
  async create(@Body() dto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(dto, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTicketDto })
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Request() req) {
    return this.ticketsService.update(id, dto, req.user.id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to ticket' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AddCommentDto })
  async addComment(@Param('id') id: string, @Body() dto: AddCommentDto, @Request() req) {
    return this.ticketsService.addComment(id, dto, req.user.id);
  }

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign tickets to user' })
  @ApiBody({ type: BulkAssignDto })
  async bulkAssign(@Body() dto: BulkAssignDto, @Request() req) {
    return this.ticketsService.bulkAssign(dto, req.user.id);
  }

  @Post('bulk-status')
  @ApiOperation({ summary: 'Bulk update ticket status' })
  @ApiBody({ type: BulkStatusDto })
  async bulkStatus(@Body() dto: BulkStatusDto, @Request() req) {
    return this.ticketsService.bulkStatus(dto, req.user.id);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Add attachment to ticket' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AddAttachmentDto })
  async addAttachment(@Param('id') id: string, @Body() dto: AddAttachmentDto, @Request() req) {
    return this.ticketsService.addAttachment(id, dto, req.user.id);
  }

  @Post('attachments/:id/delete')
  @ApiOperation({ summary: 'Delete attachment (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async deleteAttachment(@Param('id') id: string, @Request() req) {
    return this.ticketsService.deleteAttachment(id, req.user.id);
  }
}

