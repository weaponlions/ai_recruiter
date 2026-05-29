import { Module, Global } from '@nestjs/common';
import { LlmService } from './llm.service';
import { CostModule } from '../cost/cost.module';

@Global()
@Module({
  imports: [CostModule],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}
