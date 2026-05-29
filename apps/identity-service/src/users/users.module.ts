import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { IdentityPublisher } from '../events/identity.publisher';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, IdentityPublisher],
  exports: [UsersService],
})
export class UsersModule {}
