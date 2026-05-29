import { Module } from '@nestjs/common';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { MovementsRepository } from './movements.repository';
import { PipelinePublisher } from '../events/pipeline.publisher';

@Module({
  controllers: [MovementsController],
  providers: [MovementsService, MovementsRepository, PipelinePublisher],
  exports: [MovementsService],
})
export class MovementsModule {}
