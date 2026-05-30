import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogsRepository } from './logs.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({ controllers: [LogsController], providers: [LogsService, LogsRepository, PrismaService], exports: [LogsService] })
export class LogsModule {}
