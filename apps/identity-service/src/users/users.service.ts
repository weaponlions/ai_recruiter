import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { IdentityPublisher } from '../events/identity.publisher';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly prisma: PrismaService,
    private readonly publisher: IdentityPublisher,
  ) {}

  async findAll(
    tenantId: string,
    pagination: { page: number; limit: number },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repo.findMany(tenantId, { skip, take: limit }),
      this.repo.count(tenantId),
    ]);

    return {
      data: data.map(this.sanitize),
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.repo.findById(tenantId, id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.sanitize(user);
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id); // ensures tenant ownership
    const updated = await this.repo.update(tenantId, id, dto);

    if (dto.role) {
      await this.publisher.publishRoleChanged(updated);
    }

    return this.sanitize(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.repo.softDelete(tenantId, id);
  }

  async invite(tenantId: string, dto: InviteUserDto) {
    // Check seat quota
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const activeCount = await this.prisma.user.count({
      where: { tenantId, isActive: true },
    });

    const pendingInvites = await this.prisma.invite.count({
      where: { tenantId, acceptedAt: null, expiresAt: { gt: new Date() } },
    });

    if (activeCount + pendingInvites >= tenant.seatQuota) {
      throw new ConflictException(
        `Seat quota (${tenant.seatQuota}) reached. Upgrade your plan.`,
      );
    }

    // Check for existing pending invite
    const existingInvite = await this.prisma.invite.findFirst({
      where: {
        tenantId,
        email: dto.email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvite) {
      throw new ConflictException('An active invite already exists for this email');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const invite = await this.prisma.invite.create({
      data: {
        tenantId,
        email: dto.email,
        role: dto.role,
        token,
        expiresAt,
      },
    });

    await this.publisher.publishUserInvited(invite);

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    };
  }

  private sanitize(user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
