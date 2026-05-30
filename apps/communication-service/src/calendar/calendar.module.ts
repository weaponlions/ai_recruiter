import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarRepository } from './calendar.repository';
import { CommunicationPublisher } from '../events/communication.publisher';
import { PrismaService } from '../prisma/prisma.service';

@Module({ controllers: [CalendarController], providers: [CalendarService, CalendarRepository, PrismaService, CommunicationPublisher] })
export class CalendarModule {}
