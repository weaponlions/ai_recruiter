import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { EmailService } from './email.service';

class SendEmailDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsEmail()
  recipientEmail!: string;

  @IsOptional()
  variables?: Record<string, string>;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  htmlBody?: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendEmail(
    @Req() req: FastifyRequest & { tenantId: string },
    @Body() dto: SendEmailDto,
  ) {
    const log = await this.emailService.sendEmail(req.tenantId, {
      templateId: dto.templateId,
      recipientEmail: dto.recipientEmail,
      variables: dto.variables ?? {},
      subject: dto.subject,
      htmlBody: dto.htmlBody,
    });
    return {
      emailLogId: log.id,
      trackingId: log.trackingId,
      status: log.status,
      message: 'Email queued for delivery',
    };
  }
}
