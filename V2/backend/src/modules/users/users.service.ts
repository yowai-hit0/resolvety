import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, UpdateUserStatusDto, CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 10, filters?: {
    role?: string;
    is_active?: boolean;
    organization?: string;
    search?: string;
  }) {
    const where: any = {};
    
    if (filters?.role) {
      where.role = filters.role;
    }
    
    if (filters?.is_active !== undefined) {
      where.is_active = filters.is_active;
    }
    
    if (filters?.organization) {
      where.organization_id = filters.organization;
    }
    
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { first_name: { contains: filters.search, mode: 'insensitive' } },
        { last_name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
          created_at: true,
          last_login_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        organization_id: true,
        created_at: true,
        updated_at: true,
        last_login_at: true,
        last_login_ip: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tickets_created: true,
            tickets_assigned: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getMe(userId: string) {
    return this.findOne(userId);
  }

  async update(id: string, dto: UpdateUserDto, updatedBy: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        updated_by_id: updatedBy,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        organization_id: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto, updatedBy: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        is_active: dto.is_active,
        updated_by_id: updatedBy,
      },
      select: {
        id: true,
        email: true,
        is_active: true,
      },
    });
  }

  async create(dto: CreateUserDto, createdBy: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate organization if provided
    if (dto.organization_id) {
      const org = await this.prisma.organization.findUnique({
        where: { id: dto.organization_id },
      });
      if (!org) {
        throw new NotFoundException('Organization not found');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        role: dto.role,
        organization_id: dto.organization_id || null, // Allow null for super_admins and admins
        is_active: dto.is_active !== undefined ? dto.is_active : true,
        created_by_id: createdBy,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        organization_id: true,
        created_at: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return user;
  }

  async getStats() {
    const [
      total,
      byRole,
      active,
      recent,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.count({
        where: { is_active: true },
      }),
      this.prisma.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      total,
      by_role: byRole,
      active,
      recent_30_days: recent,
    };
  }
}

