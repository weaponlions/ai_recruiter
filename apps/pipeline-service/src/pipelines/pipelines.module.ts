import { Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { PipelinesRepository } from './pipelines.repository';
import { PipelinePublisher, PipelineConsumer } from '../events/pipeline.publisher';

@Module({
  controllers: [PipelinesController],
  providers: [PipelinesService, PipelinesRepository, PipelinePublisher, PipelineConsumer],
  exports: [PipelinesService],
})
export class PipelinesModule {}
