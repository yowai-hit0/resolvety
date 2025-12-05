import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { PrioritiesService } from './priorities.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

class CreatePriorityDto {
  name: string;
  sort_order?: number;
}

class UpdatePriorityDto {
  name: string;
  sort_order?: number;
}

@ApiTags('Priorities')
@Controller('priorities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrioritiesController {
  constructor(private prioritiesService: PrioritiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active priorities' })
  async findAll() {
    return this.prioritiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get priority by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.prioritiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new priority' })
  @ApiBody({ type: CreatePriorityDto })
  async create(@Body() dto: CreatePriorityDto, @Request() req) {
    return this.prioritiesService.create(dto.name, dto.sort_order || 0, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update priority' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePriorityDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePriorityDto, @Request() req) {
    return this.prioritiesService.update(id, dto.name, dto.sort_order || 0, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete priority (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string, @Request() req) {
    return this.prioritiesService.delete(id, req.user.id);
  }
}

