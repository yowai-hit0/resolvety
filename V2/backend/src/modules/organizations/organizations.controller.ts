import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateOrganizationDto {
  name: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
}

class UpdateOrganizationDto {
  name?: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
}

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.organizationsService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users in organization' })
  @ApiParam({ name: 'id', type: String })
  async getUsers(@Param('id') id: string) {
    return this.organizationsService.getUsers(id);
  }

  @Get(':id/tickets')
  @ApiOperation({ summary: 'Get all tickets for organization' })
  @ApiParam({ name: 'id', type: String })
  async getTickets(@Param('id') id: string) {
    return this.organizationsService.getTickets(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationDto })
  async create(@Body() dto: CreateOrganizationDto, @Request() req) {
    return this.organizationsService.create(
      dto.name,
      req.user.id,
      dto.domain,
      dto.email,
      dto.phone,
      dto.address,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateOrganizationDto })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto, @Request() req) {
    return this.organizationsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string, @Request() req) {
    return this.organizationsService.delete(id, req.user.id);
  }
}

