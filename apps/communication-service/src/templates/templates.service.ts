import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplatesRepository } from './templates.repository';
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
export class TemplatesService {
  constructor(private readonly repo: TemplatesRepository) {}

  async findAll(tenantId: string): Promise<EmailTemplate[]> {
    return this.repo.findAll(tenantId);
  }

  async findOne(tenantId: string, id: string): Promise<EmailTemplate> {
    const template = await this.repo.findById(tenantId, id);
    if (!template) {
      throw new NotFoundException(`Email template ${id} not found`);
    }
    return template;
  }

  async create(tenantId: string, data: CreateTemplateData): Promise<EmailTemplate> {
    return this.repo.create(tenantId, data);
  }

  async update(tenantId: string, id: string, data: UpdateTemplateData): Promise<EmailTemplate> {
    await this.findOne(tenantId, id); // throws if not found
    return this.repo.update(id, data);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id); // throws if not found
    await this.repo.delete(id);
  }

  async renderTemplate(
    template: EmailTemplate,
    variables: Record<string, string>,
  ): Promise<{ subject: string; htmlBody: string; textBody: string | null }> {
    let subject = template.subject;
    let htmlBody = template.htmlBody;
    let textBody = template.textBody ?? null;

    // Simple variable substitution: {{variableName}} → value
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      subject = subject.replace(placeholder, value);
      htmlBody = htmlBody.replace(placeholder, value);
      if (textBody) {
        textBody = textBody.replace(placeholder, value);
      }
    }

    return { subject, htmlBody, textBody };
  }
}
