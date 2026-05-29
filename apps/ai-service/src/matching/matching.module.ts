import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiPublisher } from '../events/ai.publisher';

@Module({
  controllers: [MatchingController],
  providers: [MatchingService, PrismaService, AiPublisher],
  exports: [MatchingService],
})
export class MatchingModule {}
