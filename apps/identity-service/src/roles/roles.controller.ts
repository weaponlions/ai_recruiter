import {
  Controller,
  Get,
  Param,
  UseFilters,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

/**
 * RolesController
 *
 * In this implementation roles are platform-defined enumerations
 * (not stored per-tenant in the DB). This controller exposes the
 * available roles and their associated permissions so the frontend
 * can display them in the invitation flow.
 *
 * Extend with tenant-custom-role support as needed.
 */
@Controller('roles')
@UseFilters(HttpExceptionFilter)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /api/v1/roles
   * Returns the list of all platform roles with descriptions.
   */
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * GET /api/v1/roles/:name
   * Returns role details and permission matrix.
   */
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.rolesService.findOne(name);
  }
}
