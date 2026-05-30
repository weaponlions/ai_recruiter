import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { ComplianceRepository } from './compliance.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({ controllers: [ComplianceController], providers: [ComplianceService, ComplianceRepository, PrismaService] })
export class ComplianceModule {}
