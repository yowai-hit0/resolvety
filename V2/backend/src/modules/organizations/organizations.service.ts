import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 10) {
    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take,
        include: {
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.organization.count(),
    ]);

    return { data: organizations, total, skip, take };
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
          },
        },
        user_organizations: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                is_active: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true, // Keep for backward compatibility
            user_organizations: true, // New count
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async create(name: string, userId: string, domain?: string, email?: string, phone?: string, address?: string) {
    return this.prisma.organization.create({
      data: {
        name,
        domain,
        email,
        phone,
        address,
        created_by_id: userId,
        updated_by_id: userId,
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...data,
        updated_by_id: userId,
      },
    });
  }

  async delete(id: string, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_id: userId,
      },
    });
  }

  async getUsers(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Get users through the junction table
    const userOrgs = await this.prisma.userOrganization.findMany({
      where: { organization_id: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            is_active: true,
          },
        },
      },
    });

    return userOrgs.map(uo => ({
      ...uo.user,
      is_primary: uo.is_primary,
    }));
  }

  async getTickets(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Get users through the junction table
    const userOrgs = await this.prisma.userOrganization.findMany({
      where: { organization_id: id },
      select: { user_id: true },
    });

    const userIds = userOrgs.map(uo => uo.user_id);

    return this.prisma.ticket.findMany({
      where: {
        created_by_id: { in: userIds },
      },
      include: {
        created_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        priority: true,
      },
    });
  }
}

