import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationPublisher } from '../events/communication.publisher';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService, PrismaService, CommunicationPublisher],
  exports: [TrackingService],
})
export class TrackingModule {}
