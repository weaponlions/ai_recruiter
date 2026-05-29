import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationsRepository } from './applications.repository';
import { JobPublisher } from '../events/job.publisher';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [ApplicationsController], providers: [ApplicationsService, ApplicationsRepository, JobPublisher] })
export class ApplicationsModule {}
