import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarRepository } from './calendar.repository';
import { CommunicationPublisher } from '../events/communication.publisher';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [CalendarController], providers: [CalendarService, CalendarRepository, CommunicationPublisher] })
export class CalendarModule {}
