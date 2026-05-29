import { Module } from '@nestjs/common';
import { CostService } from './cost.service';
import { CostController } from './cost.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CostController],
  providers: [CostService, PrismaService],
  exports: [CostService],
})
export class CostModule {}
