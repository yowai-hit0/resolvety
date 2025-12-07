import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, AddCommentDto, BulkAssignDto, BulkStatusDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a short, human-readable ticket code
   * Format: TKT-12345 (5-digit sequential number)
   */
  private async generateTicketCode(): Promise<string> {
    // Get total count of tickets to generate sequential number
    const ticketCount = await this.prisma.ticket.count();
    let ticketNumber = ticketCount + 1;
    let ticketCode = `TKT-${String(ticketNumber).padStart(5, '0')}`;
    
    // Ensure uniqueness (handle edge cases where count might be off)
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.prisma.ticket.findUnique({
        where: { ticket_code: ticketCode },
      });
      
      if (!existing) {
        return ticketCode;
      }
      
      // If code exists, try next number
      ticketNumber++;
      ticketCode = `TKT-${String(ticketNumber).padStart(5, '0')}`;
      attempts++;
    }
    
    // Fallback to timestamp-based if all sequential attempts fail
    return `TKT-${Date.now().toString().slice(-8)}`;
  }

  async findAll(skip = 0, take = 10, filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
    created_by?: string;
    updated_by?: string;
    category?: string;
    search?: string;
    created_at_from?: string;
    created_at_to?: string;
    updated_at_from?: string;
    updated_at_to?: string;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.priority) {
      where.priority_id = filters.priority;
    }
    
    if (filters?.assignee) {
      where.assignee_id = filters.assignee;
    }
    
    if (filters?.created_by) {
      where.created_by_id = filters.created_by;
    }
    
    if (filters?.updated_by) {
      where.updated_by_id = filters.updated_by;
    }
    
    if (filters?.category) {
      where.categories = {
        some: {
          category_id: filters.category,
        },
      };
    }
    
    if (filters?.created_at_from || filters?.created_at_to) {
      where.created_at = {};
      if (filters.created_at_from) {
        where.created_at.gte = new Date(filters.created_at_from);
      }
      if (filters.created_at_to) {
        where.created_at.lte = new Date(filters.created_at_to);
      }
    }
    
    if (filters?.updated_at_from || filters?.updated_at_to) {
      where.updated_at = {};
      if (filters.updated_at_from) {
        where.updated_at.gte = new Date(filters.updated_at_from);
      }
      if (filters.updated_at_to) {
        where.updated_at.lte = new Date(filters.updated_at_to);
      }
    }
    
    if (filters?.search) {
      where.OR = [
        { ticket_code: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { requester_email: { contains: filters.search, mode: 'insensitive' } },
        { requester_name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

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
          _count: {
            select: {
              comments: true,
              attachments: true,
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
    };
  }

  async findOne(id: string) {
    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id },
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
        throw new NotFoundException('Ticket not found');
      }

      // Return a clean serializable object (Prisma objects have non-serializable properties)
      return {
        id: ticket.id,
        ticket_code: ticket.ticket_code,
        subject: ticket.subject,
        description: ticket.description,
        requester_email: ticket.requester_email,
        requester_name: ticket.requester_name,
        requester_phone: ticket.requester_phone,
        location: ticket.location,
        status: ticket.status,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        resolved_at: ticket.resolved_at,
        closed_at: ticket.closed_at,
        created_by_id: ticket.created_by_id,
        updated_by_id: ticket.updated_by_id,
        assignee_id: ticket.assignee_id,
        priority_id: ticket.priority_id,
        created_by: ticket.created_by,
        updated_by: ticket.updated_by,
        assignee: ticket.assignee,
        priority: ticket.priority,
        categories: ticket.categories,
        comments: ticket.comments,
        attachments: ticket.attachments,
        ticket_events: ticket.ticket_events,
      };
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        ticketId: id,
      });
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      // Handle Prisma errors
      if (error.code === 'P2025') {
        throw new NotFoundException('Ticket not found');
      }
      
      // Handle foreign key constraint errors
      if (error.code === 'P2003' || error.code === 'P2014') {
        throw new BadRequestException(`Database constraint error: ${error.meta?.field_name || 'unknown field'}`);
      }
      
      throw new BadRequestException(`Failed to fetch ticket: ${error.message || 'Unknown error'}`);
    }
  }

  async create(dto: CreateTicketDto, userId: string) {
    // Generate short, human-readable ticket code
    const ticketCode = await this.generateTicketCode();

    // If assignee_id is provided, verify the user exists and is active
    if (dto.assignee_id) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: dto.assignee_id },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }

      if (!assignee.is_active) {
        throw new BadRequestException('Assignee is not active');
      }
    }

    // Validate and deduplicate category IDs
    if (dto.category_ids && dto.category_ids.length > 0) {
      // Remove duplicates and filter out empty values
      const uniqueCategoryIds = [...new Set(dto.category_ids.filter(id => id && typeof id === 'string' && id.length > 0))];
      
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

      // Use deduplicated array
      dto.category_ids = uniqueCategoryIds;
    }

    // Create ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        ticket_code: ticketCode,
        subject: dto.subject,
        description: dto.description,
        requester_email: dto.requester_email,
        requester_name: dto.requester_name,
        requester_phone: dto.requester_phone,
        location: dto.location,
        priority_id: dto.priority_id,
        assignee_id: dto.assignee_id,
        created_by_id: userId,
        updated_by_id: userId,
        categories: dto.category_ids && dto.category_ids.length > 0 ? {
          create: dto.category_ids.map(catId => ({
            category_id: catId,
          })),
        } : undefined,
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
      },
    });

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Update categories if provided
    if (dto.category_ids !== undefined) {
      // Remove duplicates and filter out empty values
      const uniqueCategoryIds = [...new Set(dto.category_ids.filter(id => id && typeof id === 'string' && id.length > 0))];
      
      // Validate categories if any are provided
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
      }

      // Delete existing categories
      await this.prisma.ticketCategory.deleteMany({
        where: { ticket_id: id },
      });
      
      // Create new categories if any are provided
      if (uniqueCategoryIds.length > 0) {
        await this.prisma.ticketCategory.createMany({
          data: uniqueCategoryIds.map(catId => ({
            ticket_id: id,
            category_id: catId,
          })),
        });
      }
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.subject && { subject: dto.subject }),
        ...(dto.description && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.assignee_id !== undefined && { assignee_id: dto.assignee_id }),
        ...(dto.priority_id && { priority_id: dto.priority_id }),
        updated_by_id: userId,
        ...(dto.status === 'Resolved' && !ticket.resolved_at && { resolved_at: new Date() }),
        ...(dto.status === 'Closed' && !ticket.closed_at && { closed_at: new Date() }),
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
      },
    });

    return updated;
  }

  async addComment(ticketId: string, dto: AddCommentDto, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        ticket_id: ticketId,
        author_id: userId,
        content: dto.content,
        is_internal: dto.is_internal || false,
      },
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
    });

    return comment;
  }

  async getStats() {
    const [
      total,
      byStatus,
      byPriority,
      recent,
    ] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.ticket.groupBy({
        by: ['priority_id'],
        _count: true,
      }),
      this.prisma.ticket.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Get priority names
    const priorityIds = byPriority.map((p: any) => p.priority_id);
    const priorities = await this.prisma.ticketPriority.findMany({
      where: { id: { in: priorityIds } },
      select: { id: true, name: true },
    });
    const priorityMap = new Map(priorities.map((p: any) => [p.id, p.name]));

    return {
      total,
      by_status: byStatus,
      by_priority: byPriority.map((p: any) => ({
        priority_id: p.priority_id,
        priority_name: priorityMap.get(p.priority_id) || 'Unknown',
        _count: p._count,
      })),
      recent_7_days: recent,
    };
  }

  async bulkAssign(dto: BulkAssignDto, userId: string) {
    const updated = await this.prisma.ticket.updateMany({
      where: {
        id: { in: dto.ticket_ids },
      },
      data: {
        assignee_id: dto.assignee_id,
        updated_by_id: userId,
      },
    });

    return { updated: updated.count };
  }

  async bulkStatus(dto: BulkStatusDto, userId: string) {
    const updateData: any = {
      status: dto.status,
      updated_by_id: userId,
    };

    if (dto.status === 'Resolved') {
      updateData.resolved_at = new Date();
    }
    if (dto.status === 'Closed') {
      updateData.closed_at = new Date();
    }

    const updated = await this.prisma.ticket.updateMany({
      where: {
        id: { in: dto.ticket_ids },
      },
      data: updateData,
    });

    return { updated: updated.count };
  }

  async addAttachment(ticketId: string, dto: any, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const attachment = await this.prisma.attachment.create({
      data: {
        ticket_id: ticketId,
        uploaded_by_id: userId,
        original_filename: dto.original_filename,
        stored_filename: dto.stored_filename,
        mime_type: dto.mime_type,
        size: dto.size,
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
    });

    return attachment;
  }

  async deleteAttachment(attachmentId: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        deleted_by_id: userId,
      },
    });

    return { message: 'Attachment deleted successfully' };
  }
}

