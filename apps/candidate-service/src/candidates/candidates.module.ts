import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { CandidatesRepository } from './candidates.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { CandidatePublisher } from '../events/candidate.publisher';
import { CandidateConsumer } from '../events/candidate.consumer';

@Module({
  imports: [PrismaModule],
  controllers: [CandidatesController],
  providers: [CandidatesService, CandidatesRepository, CandidatePublisher, CandidateConsumer],
  exports: [CandidatesService],
})
export class CandidatesModule {}
