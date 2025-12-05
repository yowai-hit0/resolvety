"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let InvitesService = class InvitesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status, email, skip = 0, take = 20) {
        const where = {};
        if (status)
            where.status = status;
        if (email)
            where.email = { contains: email, mode: 'insensitive' };
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
    async create(email, role, expiresInHours, userId) {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
        const token = crypto.randomUUID();
        const invite = await this.prisma.invite.create({
            data: {
                email: normalizedEmail,
                role,
                token,
                expires_at: expiresAt,
                status: client_1.InviteStatus.PENDING,
                created_by_id: userId,
                updated_by_id: userId,
            },
        });
        return invite;
    }
    async resend(id, userId) {
        const invite = await this.prisma.invite.findUnique({ where: { id } });
        if (!invite) {
            throw new common_1.NotFoundException('Invite not found');
        }
        if (invite.status !== client_1.InviteStatus.PENDING) {
            throw new common_1.BadRequestException('Can only resend pending invites');
        }
        return { message: 'Invite resent successfully', invite };
    }
    async revoke(id, userId) {
        const invite = await this.prisma.invite.findUnique({ where: { id } });
        if (!invite) {
            throw new common_1.NotFoundException('Invite not found');
        }
        return this.prisma.invite.update({
            where: { id },
            data: {
                status: client_1.InviteStatus.REVOKED,
                updated_by_id: userId,
            },
        });
    }
    async accept(token, password, firstName, lastName) {
        const invite = await this.prisma.invite.findUnique({
            where: { token },
        });
        if (!invite) {
            throw new common_1.NotFoundException('Invalid invite token');
        }
        if (invite.status !== client_1.InviteStatus.PENDING) {
            throw new common_1.BadRequestException('Invite has already been used or revoked');
        }
        if (new Date() > invite.expires_at) {
            await this.prisma.invite.update({
                where: { id: invite.id },
                data: { status: client_1.InviteStatus.EXPIRED },
            });
            throw new common_1.BadRequestException('Invite has expired');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: invite.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = await this.prisma.user.create({
            data: {
                email: invite.email,
                password_hash: password,
                first_name: firstName,
                last_name: lastName,
                role: invite.role,
            },
        });
        await this.prisma.invite.update({
            where: { id: invite.id },
            data: {
                status: client_1.InviteStatus.ACCEPTED,
                accepted_at: new Date(),
            },
        });
        return { user, message: 'Invite accepted successfully' };
    }
};
exports.InvitesService = InvitesService;
exports.InvitesService = InvitesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvitesService);
//# sourceMappingURL=invites.service.js.map