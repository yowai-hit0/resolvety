import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 10) {
    try {
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

      // If no organizations, return early
      if (organizations.length === 0) {
        return { 
          data: [], 
          total, 
          skip, 
          take 
        };
      }

      // Validate skip and take (already validated in controller, but double-check)
      const validSkip = isNaN(skip) || skip < 0 ? 0 : skip;
      const validTake = isNaN(take) || take < 1 ? 10 : take;

      // Get all organization IDs
      const orgIds = organizations.map(org => org.id);

      // Get all user-organization relationships for these organizations in one query
      const userOrgs = await this.prisma.userOrganization.findMany({
        where: { organization_id: { in: orgIds } },
        select: { organization_id: true, user_id: true },
      });

      // Group user IDs by organization
      const userIdsByOrg = new Map<string, string[]>();
      userOrgs.forEach(uo => {
        if (!userIdsByOrg.has(uo.organization_id)) {
          userIdsByOrg.set(uo.organization_id, []);
        }
        userIdsByOrg.get(uo.organization_id)!.push(uo.user_id);
      });

      // Calculate ticket counts for each organization
      const organizationsWithTicketCounts = await Promise.all(
        organizations.map(async (org) => {
          try {
            if (!org || !org.id) {
              console.warn('Invalid organization object:', org);
              // Return a safe default object
              return {
                id: '',
                name: '',
                domain: null,
                email: null,
                phone: null,
                address: null,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                created_by_id: null,
                updated_by_id: null,
                _count: { users: 0 },
                tickets_count: 0,
              };
            }

            const userIds = userIdsByOrg.get(org.id) || [];
            
            // Count tickets created by users in this organization
            let ticketCount = 0;
            if (userIds.length > 0) {
              try {
                ticketCount = await this.prisma.ticket.count({
                  where: {
                    created_by_id: { in: userIds },
                  },
                });
              } catch (countError: any) {
                console.error(`Error counting tickets for org ${org.id}:`, countError);
                ticketCount = 0;
              }
            }

            // Return a clean serializable object
            return {
              id: org.id,
              name: org.name,
              domain: org.domain,
              email: org.email,
              phone: org.phone,
              address: org.address,
              is_active: org.is_active,
              created_at: org.created_at,
              updated_at: org.updated_at,
              created_by_id: org.created_by_id,
              updated_by_id: org.updated_by_id,
              _count: org._count,
              tickets_count: ticketCount,
            };
          } catch (error: any) {
            // If counting fails for an organization, return with 0
            console.error(`Error processing organization ${org?.id || 'unknown'}:`, error);
            console.error('Error stack:', error?.stack);
            // Return a clean serializable object even on error
            return {
              id: org?.id,
              name: org?.name,
              domain: org?.domain,
              email: org?.email,
              phone: org?.phone,
              address: org?.address,
              is_active: org?.is_active,
              created_at: org?.created_at,
              updated_at: org?.updated_at,
              created_by_id: org?.created_by_id,
              updated_by_id: org?.updated_by_id,
              _count: org?._count,
              tickets_count: 0,
            };
          }
        })
      );

      return { data: organizationsWithTicketCounts, total, skip, take };
    } catch (error: any) {
      console.error('Error in findAll organizations:', error);
      console.error('Error stack:', error?.stack);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        skip,
        take,
      });
      
      // Fallback: return organizations without ticket counts
      try {
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

        return {
          data: organizations.map(org => ({
            id: org.id,
            name: org.name,
            domain: org.domain,
            email: org.email,
            phone: org.phone,
            address: org.address,
            is_active: org.is_active,
            created_at: org.created_at,
            updated_at: org.updated_at,
            created_by_id: org.created_by_id,
            updated_by_id: org.updated_by_id,
            _count: org._count,
            tickets_count: 0,
          })),
          total,
          skip,
          take,
        };
      } catch (fallbackError: any) {
        console.error('Error in fallback findAll:', fallbackError);
        // Last resort: return empty result
        return {
          data: [],
          total: 0,
          skip,
          take,
        };
      }
    }
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

    // Calculate ticket count for this organization
    const userOrgs = await this.prisma.userOrganization.findMany({
      where: { organization_id: id },
      select: { user_id: true },
    });

    const userIds = userOrgs.map(uo => uo.user_id);
    const ticketCount = userIds.length > 0
      ? await this.prisma.ticket.count({
          where: {
            created_by_id: { in: userIds },
          },
        })
      : 0;

    return {
      ...org,
      tickets_count: ticketCount,
    };
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

    // Build update data object with only provided fields
    const dataToUpdate: any = {
      updated_by_id: userId,
    };

    // Only include fields that are actually provided
    if (data.name !== undefined) {
      dataToUpdate.name = data.name;
    }
    if (data.domain !== undefined) {
      dataToUpdate.domain = data.domain;
    }
    if (data.email !== undefined) {
      dataToUpdate.email = data.email;
    }
    if (data.phone !== undefined) {
      dataToUpdate.phone = data.phone;
    }
    if (data.address !== undefined) {
      dataToUpdate.address = data.address;
    }
    if (data.is_active !== undefined) {
      dataToUpdate.is_active = data.is_active;
    }

    return this.prisma.organization.update({
      where: { id },
      data: dataToUpdate,
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

