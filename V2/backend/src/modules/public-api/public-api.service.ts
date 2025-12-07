import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiRegisterUserDto, ApiCreateTicketDto } from './dto/public-api.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PublicApiService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a short, random, unique ticket code
   * Format: TKT-A3B7C (prefix + 5 random alphanumeric characters)
   */
  private async generateTicketCode(): Promise<string> {
    const prefix = 'TKT-';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
    const codeLength = 5;
    
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      // Generate random code
      let randomCode = '';
      for (let i = 0; i < codeLength; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const ticketCode = `${prefix}${randomCode}`;
      
      // Check if code already exists
      const existing = await this.prisma.ticket.findUnique({
        where: { ticket_code: ticketCode },
      });
      
      if (!existing) {
        return ticketCode;
      }
      
      attempts++;
    }
    
    // Fallback: use timestamp + random if all attempts fail (extremely unlikely)
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.random().toString(36).toUpperCase().slice(2, 4);
    return `${prefix}${timestamp}${random}`;
  }

  async registerUser(dto: ApiRegisterUserDto, app: any) {
    // If email is provided, check if user already exists
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
    }

    // Generate a unique email if not provided (using phone as identifier)
    let userEmail = dto.email;
    if (!userEmail) {
      // Create email from phone number and organization
      const phoneClean = dto.phone.replace(/\D/g, ''); // Remove non-digits
      const orgName = app.organization.name.toLowerCase().replace(/\s+/g, '');
      userEmail = `user_${phoneClean}@${orgName}.api`;
      
      // Check if this generated email already exists, if so append a number
      let counter = 1;
      while (await this.prisma.user.findUnique({ where: { email: userEmail } })) {
        userEmail = `user_${phoneClean}_${counter}@${orgName}.api`;
        counter++;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user in the app's organization
    const user = await this.prisma.user.create({
      data: {
        email: userEmail,
        password_hash: passwordHash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        role: 'customer', // Default role for API-registered users
        organization_id: app.organization_id, // Keep for backward compatibility
        is_active: true,
        // Also create user_organizations relationship
        user_organizations: {
          create: {
            organization_id: app.organization_id,
            is_primary: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        organization_id: true,
        created_at: true,
      },
    });

    return user;
  }

  async createTicket(dto: ApiCreateTicketDto, app: any) {
    // Verify user exists and belongs to the app's organization
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user belongs to the app's organization (both old and new relationship)
    const belongsToOrg = user.organization_id === app.organization_id || 
      await this.prisma.userOrganization.findUnique({
        where: {
          user_id_organization_id: {
            user_id: user.id,
            organization_id: app.organization_id,
          },
        },
      });
    
    if (!belongsToOrg) {
      throw new BadRequestException('User does not belong to the app\'s organization');
    }

    if (!user.is_active) {
      throw new BadRequestException('User is not active');
    }

    // Verify priority exists
    const priority = await this.prisma.ticketPriority.findUnique({
      where: { id: dto.priority_id },
    });

    if (!priority) {
      throw new NotFoundException('Priority not found');
    }

    // Generate short, human-readable ticket code
    const ticketCode = await this.generateTicketCode();

    // Try to get phone from user's most recent ticket, otherwise use placeholder
    let requesterPhone = '';
    const recentTicket = await this.prisma.ticket.findFirst({
      where: {
        created_by_id: user.id,
      },
      orderBy: { created_at: 'desc' },
      select: { requester_phone: true },
    });
    if (recentTicket && recentTicket.requester_phone) {
      requesterPhone = recentTicket.requester_phone;
    } else {
      // Use placeholder if no previous ticket exists
      requesterPhone = 'N/A';
    }

    // Validate and deduplicate category IDs if provided
    let categoryIdsToCreate: string[] | undefined = undefined;
    if (dto.category_ids && dto.category_ids.length > 0) {
      // Remove duplicates and filter out empty values
      const uniqueCategoryIds = [...new Set(dto.category_ids.filter(id => id && typeof id === 'string' && id.length > 0))];
      
      if (uniqueCategoryIds.length > 0) {
        // Verify all categories exist and are active
        const categories = await this.prisma.category.findMany({
          where: {
            id: { in: uniqueCategoryIds },
            is_active: true,
          },
        });

        if (categories.length !== uniqueCategoryIds.length) {
          const foundIds = new Set(categories.map(c => c.id));
          const missingIds = uniqueCategoryIds.filter(id => !foundIds.has(id));
          throw new BadRequestException(
            `Invalid or inactive category IDs: ${missingIds.join(', ')}`
          );
        }

        categoryIdsToCreate = uniqueCategoryIds;
      }
    }

    // Create ticket with user as creator
    const ticket = await this.prisma.ticket.create({
      data: {
        ticket_code: ticketCode,
        subject: dto.subject,
        description: dto.description,
        requester_email: user.email,
        requester_name: `${user.first_name} ${user.last_name}`,
        requester_phone: requesterPhone,
        location: dto.location,
        priority_id: dto.priority_id,
        created_by_id: user.id,
        updated_by_id: user.id,
        categories: categoryIdsToCreate && categoryIdsToCreate.length > 0 ? {
          create: categoryIdsToCreate.map(catId => ({
            category_id: catId,
          })),
        } : undefined,
      },
      include: {
        priority: true,
        assignee: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        created_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return ticket;
  }

  async getUserTickets(
    app: any,
    userId: string,
    status?: string,
    skip = 0,
    take = 10,
  ) {
    // Validate that userId is provided
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify user belongs to the app's organization (check both old and new relationship)
    const belongsToOrg = user.organization_id === app.organization_id || 
      await this.prisma.userOrganization.findUnique({
        where: {
          user_id_organization_id: {
            user_id: user.id,
            organization_id: app.organization_id,
          },
        },
      });
    
    if (!belongsToOrg) {
      throw new BadRequestException('User does not belong to the app\'s organization');
    }

    // Build where clause
    const where: any = {
      OR: [
        { created_by_id: user.id },
        { assignee_id: user.id },
      ],
    };

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Get tickets with all details
    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        include: {
          created_by: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          updated_by: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          priority: true,
          categories: {
            include: {
              category: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
            orderBy: {
              created_at: 'asc',
            },
          },
          attachments: {
            where: {
              is_deleted: false,
            },
            include: {
              uploaded_by: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
          ticket_events: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      total,
      skip,
      take,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  async getUserTicket(ticketId: string, app: any, userId: string) {
    // Validate that userId is provided
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify user belongs to the app's organization
    if (user.organization_id !== app.organization_id) {
      throw new BadRequestException('User does not belong to the app\'s organization');
    }

    // Get ticket with all details
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        OR: [
          { created_by_id: user.id },
          { assignee_id: user.id },
        ],
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
        updated_by: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        priority: true,
        categories: {
          include: {
            category: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
        attachments: {
          where: {
            is_deleted: false,
          },
          include: {
            uploaded_by: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        ticket_events: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found or user does not have access to this ticket');
    }

    return ticket;
  }

  async getCategories(app: any) {
    // Get all active categories (categories are global, not organization-specific)
    // But we can filter by organization if needed in the future
    return this.prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async getPriorities(app: any) {
    // Get all active priorities (priorities are global, not organization-specific)
    // But we can filter by organization if needed in the future
    return this.prisma.ticketPriority.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      select: {
        id: true,
        name: true,
        sort_order: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async getUserProfile(app: any, phone: string) {
    // Validate that phone is provided
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    // Find user by phone - look for tickets with this requester_phone
    // and get the user who created them (most recent ticket)
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        requester_phone: phone,
      },
      orderBy: { created_at: 'desc' },
      select: { created_by_id: true },
    });

    if (!ticket || !ticket.created_by_id) {
      throw new NotFoundException('User not found for this phone number');
    }

    // Verify user belongs to the app's organization through junction table
    const userOrg = await this.prisma.userOrganization.findUnique({
      where: {
        user_id_organization_id: {
          user_id: ticket.created_by_id,
          organization_id: app.organization_id,
        },
      },
    });

    // Also check old organization_id for backward compatibility
    const user = await this.prisma.user.findFirst({
      where: {
        id: ticket.created_by_id,
        OR: [
          { organization_id: app.organization_id },
          { user_organizations: { some: { organization_id: app.organization_id } } },
        ],
        is_active: true,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        organization_id: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found in this organization');
    }

    return user;
  }
}

