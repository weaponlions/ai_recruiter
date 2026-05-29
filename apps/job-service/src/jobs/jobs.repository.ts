import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, where: Prisma.JobWhereInput = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.prisma.job.findMany({ where: { tenantId, ...where }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.job.count({ where: { tenantId, ...where } }),
    ]);
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.job.findFirst({ where: { id, tenantId } });
  }

  create(tenantId: string, data: Prisma.JobCreateInput) {
    return this.prisma.job.create({ data: { ...data, tenantId } });
  }

  update(tenantId: string, id: string, data: Prisma.JobUpdateInput) {
    return this.prisma.job.update({ where: { id }, data, });
  }

  delete(tenantId: string, id: string) {
    return this.prisma.job.delete({ where: { id } });
  }
}
