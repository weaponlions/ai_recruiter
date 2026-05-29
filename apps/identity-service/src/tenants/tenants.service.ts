import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly repo: TenantsRepository) {}

  async getById(tenantId: string) {
    const tenant = await this.repo.findById(tenantId);
    if (!tenant) throw new NotFoundException(`Tenant ${tenantId} not found`);
    return tenant;
  }

  async update(
    tenantId: string,
    data: { name?: string; seatQuota?: number },
  ) {
    await this.getById(tenantId); // ensure exists
    return this.repo.update(tenantId, data);
  }
}
