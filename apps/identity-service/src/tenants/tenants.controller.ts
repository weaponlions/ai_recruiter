import {
  Controller,
  Get,
  Patch,
  Body,
  Headers,
  UseFilters,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('tenants')
@UseFilters(HttpExceptionFilter)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * GET /api/v1/tenants/me
   * Returns the calling tenant's profile.
   */
  @Get('me')
  getMe(@Headers('x-tenant-id') tenantId: string) {
    return this.tenantsService.getById(tenantId);
  }

  /**
   * PATCH /api/v1/tenants/me
   * Allows updating tenant name or plan.
   */
  @Patch('me')
  updateMe(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { name?: string; seatQuota?: number },
  ) {
    return this.tenantsService.update(tenantId, body);
  }
}
