import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ParsingController } from './parsing.controller';
import { ParsingService } from './parsing.service';
import { ParsingRepository } from './parsing.repository';
import { PrismaService } from '../prisma/prisma.service';

export const PARSE_QUEUE = 'parse-queue';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379').hostname,
        port: Number(new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379').port || 6379),
      },
    }),
    BullModule.registerQueue({ name: PARSE_QUEUE }),
  ],
  controllers: [ParsingController],
  providers: [ParsingService, ParsingRepository, PrismaService],
  exports: [ParsingService],
})
export class ParsingModule {}
