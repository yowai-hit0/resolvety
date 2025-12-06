import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get general analytics' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('analytics/tickets')
  @ApiOperation({ summary: 'Get ticket analytics' })
  async getTicketAnalytics() {
    return this.adminService.getTicketAnalytics();
  }

  @Get('analytics/users')
  @ApiOperation({ summary: 'Get user analytics' })
  async getUserAnalytics() {
    return this.adminService.getUserAnalytics();
  }

  @Get('analytics/agent-performance')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  async getAgentPerformance() {
    return this.adminService.getAgentPerformance();
  }

  @Get('analytics/status-trend')
  @ApiOperation({ summary: 'Get ticket status trend over time' })
  async getStatusTrend(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.adminService.getStatusTrend(daysNum);
  }
}

