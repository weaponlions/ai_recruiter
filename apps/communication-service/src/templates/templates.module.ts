import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplatesRepository } from './templates.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplatesRepository, PrismaService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
