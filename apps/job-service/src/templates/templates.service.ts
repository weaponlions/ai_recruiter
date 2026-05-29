import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplatesRepository } from './templates.repository';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly repo: TemplatesRepository) {}
  findAll(tenantId: string) { return this.repo.findAll(tenantId); }
  async findOne(tenantId: string, id: string) {
    const t = await this.repo.findOne(tenantId, id);
    if (!t) throw new NotFoundException(`Template ${id} not found`);
    return t;
  }
  create(tenantId: string, dto: CreateTemplateDto) { return this.repo.create(tenantId, dto); }
  async update(tenantId: string, id: string, dto: Partial<CreateTemplateDto>) {
    await this.findOne(tenantId, id);
    return this.repo.update(id, dto);
  }
  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.repo.delete(id);
  }
}
