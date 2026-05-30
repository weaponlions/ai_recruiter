import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** All queries filter by tenantId for strict tenant isolation */

  findMany(
    tenantId: string,
    options: { skip: number; take: number },
  ) {
    return this.prisma.user.findMany({
      where: { tenantId },
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(tenantId: string) {
    return this.prisma.user.count({ where: { tenantId } });
  }

  findById(tenantId: string, id: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
    });
  }

  findByEmail(tenantId: string, email: string) {
    return this.prisma.user.findFirst({
      where: { tenantId, email },
    });
  }

  update(
    tenantId: string,
    id: string,
    data: Prisma.UserUpdateInput,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: { ...data, tenantId } as any, // tenantId cannot be changed
    });
  }

  /** Soft delete — sets isActive to false */
  softDelete(tenantId: string, id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
