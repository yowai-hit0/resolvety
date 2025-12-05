import { Controller, Get, Post, Put, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto, UpdateUserStatusDto, CreateUserDto } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, type: String, enum: ['Admin', 'Agent'] })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiQuery({ name: 'organization', required: false, type: String, description: 'Organization ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in email, first name, last name' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('role') role?: string,
    @Query('is_active') is_active?: string,
    @Query('organization') organization?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
      {
        role,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        organization,
        search,
      },
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create a new user (Super Admin only)' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto, @Request() req) {
    return this.usersService.create(dto, req.user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, dto, req.user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status (activate/deactivate)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserStatusDto })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto, @Request() req) {
    return this.usersService.updateStatus(id, dto, req.user.id);
  }
}

