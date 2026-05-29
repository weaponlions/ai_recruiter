import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TrackingService } from './tracking.service';

// 1x1 transparent PNG pixel (base64)
const TRACKING_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('open/:trackingId')
  async trackOpen(
    @Param('trackingId') trackingId: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const userAgent = req.headers['user-agent'] ?? undefined;
    const ipAddress = req.ip ?? undefined;

    // Record open event asynchronously — don't block the pixel response
    void this.trackingService.recordOpen(trackingId, userAgent, ipAddress);

    // Return 1x1 transparent PNG immediately
    void reply
      .header('Content-Type', 'image/png')
      .header('Cache-Control', 'no-store, no-cache, must-revalidate')
      .header('Pragma', 'no-cache')
      .send(TRACKING_PIXEL);
  }

  @Get('click/:trackingId')
  async trackClick(
    @Param('trackingId') trackingId: string,
    @Query('url') redirectUrl: string,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const userAgent = req.headers['user-agent'] ?? undefined;
    const ipAddress = req.ip ?? undefined;

    // Record click event asynchronously
    void this.trackingService.recordClick(trackingId, userAgent, ipAddress);

    // Redirect to the target URL
    if (redirectUrl) {
      void reply.redirect(redirectUrl);
    } else {
      void reply.status(400).send({ message: 'Missing url query parameter' });
    }
  }
}
