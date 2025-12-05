import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole, InviteStatus } from '@prisma/client';

class CreateInviteDto {
  email: string;
  role: UserRole;
  expiresInHours?: number;
}

class AcceptInviteDto {
  token: string;
  password: string;
  first_name: string;
  last_name: string;
}

@ApiTags('Invites')
@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invites (admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: InviteStatus })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async findAll(
    @Query('status') status?: InviteStatus,
    @Query('email') email?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.invitesService.findAll(
      status,
      email,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invite (admin only)' })
  @ApiBody({ type: CreateInviteDto })
  async create(@Body() dto: CreateInviteDto, @Request() req) {
    return this.invitesService.create(
      dto.email,
      dto.role,
      dto.expiresInHours || 72,
      req.user.id,
    );
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invite email (admin only)' })
  @ApiParam({ name: 'id', type: String })
  async resend(@Param('id') id: string, @Request() req) {
    return this.invitesService.resend(id, req.user.id);
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke invite (admin only)' })
  @ApiParam({ name: 'id', type: String })
  async revoke(@Param('id') id: string, @Request() req) {
    return this.invitesService.revoke(id, req.user.id);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept invite (public endpoint)' })
  @ApiBody({ type: AcceptInviteDto })
  async accept(@Body() dto: AcceptInviteDto) {
    // Hash password before passing to service
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.invitesService.accept(dto.token, hashedPassword, dto.first_name, dto.last_name);
  }
}

