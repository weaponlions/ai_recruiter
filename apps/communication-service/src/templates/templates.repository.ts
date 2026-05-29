import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailTemplate } from '@prisma/client';

interface CreateTemplateData {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

interface UpdateTemplateData {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
}

@Injectable()
export class TemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<EmailTemplate[]> {
    return this.prisma.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string): Promise<EmailTemplate | null> {
    return this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });
  }

  async findByName(tenantId: string, name: string): Promise<EmailTemplate | null> {
    return this.prisma.emailTemplate.findFirst({
      where: { tenantId, name },
    });
  }

  async create(tenantId: string, data: CreateTemplateData): Promise<EmailTemplate> {
    return this.prisma.emailTemplate.create({
      data: {
        tenantId,
        name: data.name,
        subject: data.subject,
        htmlBody: data.htmlBody,
        textBody: data.textBody,
      },
    });
  }

  async update(id: string, data: UpdateTemplateData): Promise<EmailTemplate> {
    return this.prisma.emailTemplate.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        htmlBody: data.htmlBody,
        textBody: data.textBody,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.emailTemplate.delete({ where: { id } });
  }
}
