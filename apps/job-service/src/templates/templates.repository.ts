import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}
  findAll(tenantId: string) { return this.prisma.jobTemplate.findMany({ where: { tenantId } }); }
  findOne(tenantId: string, id: string) { return this.prisma.jobTemplate.findFirst({ where: { id, tenantId } }); }
  create(tenantId: string, data: { name: string; content: object }) { return this.prisma.jobTemplate.create({ data: { ...data, tenantId } }); }
  update(id: string, data: { name?: string; content?: object }) { return this.prisma.jobTemplate.update({ where: { id }, data }); }
  delete(id: string) { return this.prisma.jobTemplate.delete({ where: { id } }); }
}
