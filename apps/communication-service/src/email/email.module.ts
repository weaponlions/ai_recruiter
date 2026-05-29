import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { TemplatesModule } from '../templates/templates.module';
import { PrismaService } from '../prisma/prisma.service';
import { CommunicationPublisher } from '../events/communication.publisher';

@Module({
  imports: [TemplatesModule],
  controllers: [EmailController],
  providers: [EmailService, PrismaService, CommunicationPublisher],
  exports: [EmailService],
})
export class EmailModule {}
