import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplatesRepository } from './templates.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [TemplatesController], providers: [TemplatesService, TemplatesRepository] })
export class TemplatesModule {}
