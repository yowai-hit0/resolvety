import { Controller, Get, Post, Put, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateTicketStatusDto, UpdateTicketPriorityDto } from './dto/agent.dto';

@ApiTags('Agent')
@Controller('agent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get agent dashboard data' })
  async getDashboard(@Request() req) {
    return this.agentService.getDashboard(req.user.id);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get agent assigned tickets' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, type: String, enum: ['New', 'Assigned', 'In_Progress', 'Resolved', 'Closed'] })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in ticket code, subject, description, requester' })
  @ApiQuery({ name: 'sort_by', required: false, type: String, enum: ['ticket_code', 'subject', 'status', 'priority', 'created_at', 'updated_at'] })
  @ApiQuery({ name: 'sort_order', required: false, type: String, enum: ['asc', 'desc'], example: 'desc' })
  async getTickets(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: 'asc' | 'desc',
  ) {
    return this.agentService.getTickets(
      req.user.id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
      status,
      priority,
      search,
      sortBy,
      sortOrder || 'desc',
    );
  }

  @Put('tickets/:id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTicketStatusDto })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
    @Request() req,
  ) {
    return this.agentService.updateTicketStatus(id, dto.status, req.user.id);
  }

  @Put('tickets/:id/priority')
  @ApiOperation({ summary: 'Update ticket priority' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTicketPriorityDto })
  async updateTicketPriority(
    @Param('id') id: string,
    @Body() dto: UpdateTicketPriorityDto,
    @Request() req,
  ) {
    return this.agentService.updateTicketPriority(id, dto.priority_id, req.user.id);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  async getPerformance(@Request() req) {
    return this.agentService.getPerformance(req.user.id);
  }
}

