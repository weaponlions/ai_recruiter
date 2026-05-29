import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  update(id: string, data: { name?: string; seatQuota?: number }) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
