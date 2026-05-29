import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/v1/users?page=1&limit=20
   * Returns paginated list of users belonging to the caller's tenant.
   */
  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.usersService.findAll(tenantId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  /**
   * GET /api/v1/users/:id
   */
  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(tenantId, id);
  }

  /**
   * PATCH /api/v1/users/:id
   */
  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, dto);
  }

  /**
   * DELETE /api/v1/users/:id — soft-delete (sets isActive=false)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.remove(tenantId, id);
  }

  /**
   * POST /api/v1/users/invite
   * Sends an invite to join the tenant.
   */
  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.usersService.invite(tenantId, dto);
  }
}
