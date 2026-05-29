import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { TemplatesService } from '../templates/templates.service';
import { CommunicationPublisher } from '../events/communication.publisher';
import { EmailLog } from '@prisma/client';

interface SendEmailOptions {
  templateId?: string;
  recipientEmail: string;
  variables: Record<string, string>;
  subject?: string;
  htmlBody?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly trackingBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
    private readonly publisher: CommunicationPublisher,
  ) {
    this.resend = new Resend(process.env['RESEND_API_KEY'] ?? '');
    this.fromEmail = process.env['FROM_EMAIL'] ?? 'noreply@example.com';
    this.trackingBaseUrl = process.env['TRACKING_BASE_URL'] ?? 'http://localhost:3007/api/v1';
  }

  async sendEmail(tenantId: string, options: SendEmailOptions): Promise<EmailLog> {
    let subject: string;
    let htmlBody: string;
    let textBody: string | null = null;

    if (options.templateId) {
      const template = await this.templatesService.findOne(tenantId, options.templateId);
      const rendered = await this.templatesService.renderTemplate(template, options.variables);
      subject = rendered.subject;
      htmlBody = rendered.htmlBody;
      textBody = rendered.textBody;
    } else if (options.subject && options.htmlBody) {
      subject = options.subject;
      htmlBody = options.htmlBody;
    } else {
      throw new BadRequestException('Either templateId or both subject+htmlBody must be provided');
    }

    // Create email log (status=QUEUED initially)
    const emailLog = await this.prisma.emailLog.create({
      data: {
        tenantId,
        recipientEmail: options.recipientEmail,
        templateId: options.templateId,
        subject,
        status: 'QUEUED',
      },
    });

    // Inject tracking pixel
    const trackingPixelUrl = `${this.trackingBaseUrl}/track/open/${emailLog.trackingId}`;
    const trackedHtml = `${htmlBody}<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`;

    try {
      await this.dispatchViaResend(options.recipientEmail, subject, trackedHtml, textBody);

      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      await this.publisher.publishEmailSent(tenantId, emailLog.id, options.recipientEmail);
      this.logger.log(`Email sent: logId=${emailLog.id} to=${options.recipientEmail}`);

      return { ...emailLog, status: 'SENT', sentAt: new Date() };
    } catch (resendErr) {
      this.logger.warn(`Resend failed, falling back to SMTP: ${(resendErr as Error).message}`);

      try {
        await this.dispatchViaSmtp(options.recipientEmail, subject, trackedHtml, textBody);

        await this.prisma.emailLog.update({
          where: { id: emailLog.id },
          data: { status: 'SENT', sentAt: new Date() },
        });

        await this.publisher.publishEmailSent(tenantId, emailLog.id, options.recipientEmail);
        this.logger.log(`Email sent via SMTP fallback: logId=${emailLog.id}`);

        return { ...emailLog, status: 'SENT', sentAt: new Date() };
      } catch (smtpErr) {
        this.logger.error(`SMTP fallback also failed: ${(smtpErr as Error).message}`);

        await this.prisma.emailLog.update({
          where: { id: emailLog.id },
          data: { status: 'FAILED' },
        });

        return { ...emailLog, status: 'FAILED' };
      }
    }
  }

  private async dispatchViaResend(
    to: string,
    subject: string,
    html: string,
    text: string | null,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject,
      html,
      text: text ?? undefined,
    });
  }

  private async dispatchViaSmtp(
    to: string,
    subject: string,
    html: string,
    text: string | null,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env['SMTP_HOST'] ?? 'localhost',
      port: Number(process.env['SMTP_PORT'] ?? 587),
      secure: false,
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS'],
      },
    });

    await transporter.sendMail({
      from: this.fromEmail,
      to,
      subject,
      html,
      text: text ?? undefined,
    });
  }
}
