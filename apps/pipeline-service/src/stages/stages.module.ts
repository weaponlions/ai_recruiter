import { Module } from '@nestjs/common';
import { StagesController } from './stages.controller';
import { StagesService } from './stages.service';
import { StagesRepository } from './stages.repository';
import { PipelinePublisher } from '../events/pipeline.publisher';

@Module({
  controllers: [StagesController],
  providers: [StagesService, StagesRepository, PipelinePublisher],
  exports: [StagesService],
})
export class StagesModule {}
