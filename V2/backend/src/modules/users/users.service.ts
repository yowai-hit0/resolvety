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
      // Filter by organization using the junction table
      where.user_organizations = {
        some: {
          organization_id: filters.organization,
        },
      };
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
          user_organizations: {
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
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
        organization_id: true, // Keep for backward compatibility
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
        user_organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
          },
          orderBy: [
            { is_primary: 'desc' },
            { created_at: 'asc' },
          ],
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

    // Handle organization_ids update separately
    const { organization_ids, organization_id, ...updateData } = dto as any;

    // If organization_ids is provided, update the relationships
    if (organization_ids !== undefined) {
      // Validate organizations
      if (organization_ids.length > 0) {
        const orgs = await this.prisma.organization.findMany({
          where: { id: { in: organization_ids } },
        });
        
        if (orgs.length !== organization_ids.length) {
          throw new NotFoundException('One or more organizations not found');
        }
      }

      // Delete existing relationships
      await this.prisma.userOrganization.deleteMany({
        where: { user_id: id },
      });

      // Create new relationships
      if (organization_ids.length > 0) {
        await this.prisma.userOrganization.createMany({
          data: organization_ids.map((orgId: string, index: number) => ({
            user_id: id,
            organization_id: orgId,
            is_primary: index === 0, // First organization is primary
            created_by_id: updatedBy,
          })),
        });
      }
    }

    // Build update data object with only provided fields
    const dataToUpdate: any = {
      updated_by_id: updatedBy,
    };

    // Only include fields that are actually provided
    if (dto.first_name !== undefined) {
      dataToUpdate.first_name = dto.first_name;
    }
    if (dto.last_name !== undefined) {
      dataToUpdate.last_name = dto.last_name;
    }
    if (dto.role !== undefined) {
      dataToUpdate.role = dto.role;
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user_organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
          },
          orderBy: [
            { is_primary: 'desc' },
            { created_at: 'asc' },
          ],
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
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

    // Validate organizations if provided
    const organizationIds = dto.organization_ids || (dto.organization_id ? [dto.organization_id] : []);
    
    if (organizationIds.length > 0) {
      const orgs = await this.prisma.organization.findMany({
        where: { id: { in: organizationIds } },
      });
      
      if (orgs.length !== organizationIds.length) {
        throw new NotFoundException('One or more organizations not found');
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
        organization_id: dto.organization_id || null, // Keep for backward compatibility
        is_active: dto.is_active !== undefined ? dto.is_active : true,
        created_by_id: createdBy,
        // Create user_organizations relationships
        ...(organizationIds.length > 0 && {
          user_organizations: {
            create: organizationIds.map((orgId, index) => ({
              organization_id: orgId,
              is_primary: index === 0, // First organization is primary
              created_by_id: createdBy,
            })),
          },
        }),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        user_organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
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

