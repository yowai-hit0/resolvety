import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrioritiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ticketPriority.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  }

  async findOne(id: string) {
    const priority = await this.prisma.ticketPriority.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!priority) {
      throw new NotFoundException('Priority not found');
    }

    return priority;
  }

  async create(name: string, sortOrder: number, userId: string) {
    const existing = await this.prisma.ticketPriority.findFirst({
      where: { name },
    });

    if (existing) {
      throw new ConflictException('Priority with this name already exists');
    }

    return this.prisma.ticketPriority.create({
      data: {
        name,
        sort_order: sortOrder,
        created_by_id: userId,
        updated_by_id: userId,
      },
    });
  }

  async update(id: string, name: string, sortOrder: number, userId: string) {
    const priority = await this.prisma.ticketPriority.findUnique({ where: { id } });
    if (!priority) {
      throw new NotFoundException('Priority not found');
    }

    if (name !== priority.name) {
      const existing = await this.prisma.ticketPriority.findFirst({
        where: { name },
      });
      if (existing) {
        throw new ConflictException('Priority with this name already exists');
      }
    }

    return this.prisma.ticketPriority.update({
      where: { id },
      data: {
        name,
        sort_order: sortOrder,
        updated_by_id: userId,
      },
    });
  }

  async delete(id: string, userId: string) {
    const priority = await this.prisma.ticketPriority.findUnique({ where: { id } });
    if (!priority) {
      throw new NotFoundException('Priority not found');
    }

    return this.prisma.ticketPriority.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_id: userId,
      },
    });
  }
}

