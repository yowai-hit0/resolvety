import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, InviteStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: InviteStatus, email?: string, skip = 0, take = 20) {
    const where: any = {};
    if (status) where.status = status;
    if (email) where.email = { contains: email, mode: 'insensitive' };

    const [invites, total] = await Promise.all([
      this.prisma.invite.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.invite.count({ where }),
    ]);

    return { data: invites, total, skip, take };
  }

  async create(email: string, role: UserRole, expiresInHours: number, userId: string) {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const token = crypto.randomUUID();

    const invite = await this.prisma.invite.create({
      data: {
        email: normalizedEmail,
        role,
        token,
        expires_at: expiresAt,
        status: InviteStatus.PENDING,
        created_by_id: userId,
        updated_by_id: userId,
      },
    });

    // TODO: Send email here
    return invite;
  }

  async resend(id: string, userId: string) {
    const invite = await this.prisma.invite.findUnique({ where: { id } });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Can only resend pending invites');
    }

    // TODO: Resend email
    return { message: 'Invite resent successfully', invite };
  }

  async revoke(id: string, userId: string) {
    const invite = await this.prisma.invite.findUnique({ where: { id } });
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return this.prisma.invite.update({
      where: { id },
      data: {
        status: InviteStatus.REVOKED,
        updated_by_id: userId,
      },
    });
  }

  async accept(token: string, password: string, firstName: string, lastName: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite has already been used or revoked');
    }

    if (new Date() > invite.expires_at) {
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      });
      throw new BadRequestException('Invite has expired');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invite.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user and mark invite as accepted
    const user = await this.prisma.user.create({
      data: {
        email: invite.email,
        password_hash: password, // Should be hashed in controller
        first_name: firstName,
        last_name: lastName,
        role: invite.role,
      },
    });

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.ACCEPTED,
        accepted_at: new Date(),
      },
    });

    return { user, message: 'Invite accepted successfully' };
  }
}

