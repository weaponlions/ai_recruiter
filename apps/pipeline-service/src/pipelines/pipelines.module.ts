import { Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';
import { PipelinesRepository } from './pipelines.repository';
import { PipelinePublisher } from '../events/pipeline.publisher';
import { PipelineConsumer } from '../events/pipeline.consumer';

@Module({
  controllers: [PipelinesController],
  providers: [PipelinesService, PipelinesRepository, PipelinePublisher, PipelineConsumer],
  exports: [PipelinesService],
})
export class PipelinesModule {}
