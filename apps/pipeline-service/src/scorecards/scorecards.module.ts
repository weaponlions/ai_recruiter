import { Module } from '@nestjs/common';
import { ScorecardsController } from './scorecards.controller';
import { ScorecardsService } from './scorecards.service';
import { ScorecardsRepository } from './scorecards.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [ScorecardsController], providers: [ScorecardsService, ScorecardsRepository] })
export class ScorecardsModule {}
