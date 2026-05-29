import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

/**
 * GatewayController
 *
 * Each group of routes:
 *  1. Validates the Bearer JWT (RS256) via JwtAuthGuard.
 *  2. Extracts tenantId / userId / role from the token claims.
 *  3. Injects X-Tenant-ID, X-User-ID, X-User-Role headers.
 *  4. Proxies the request to the appropriate downstream service.
 *
 * Public routes (/auth/*) bypass JWT validation.
 */
@Controller()
@UseFilters(HttpExceptionFilter)
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  // ─── Public: Auth routes (no JWT guard) ───────────────────────────────────

  @All('auth/*')
  async proxyAuth(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(req, reply, 'IDENTITY_SERVICE_URL');
  }

  // ─── Protected routes (JWT guard applied) ─────────────────────────────────

  @All('jobs/*')
  @UseGuards(JwtAuthGuard)
  async proxyJobs(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(req, reply, 'JOB_SERVICE_URL');
  }

  @All('candidates/*')
  @UseGuards(JwtAuthGuard)
  async proxyCandidates(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    return this.gatewayService.proxyRequest(
      req,
      reply,
      'CANDIDATE_SERVICE_URL',
    );
  }

  @All('pipelines/*')
  @UseGuards(JwtAuthGuard)
  async proxyPipelines(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(
      req,
      reply,
      'PIPELINE_SERVICE_URL',
    );
  }

  @All('files/*')
  @UseGuards(JwtAuthGuard)
  async proxyFiles(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(
      req,
      reply,
      'DOCUMENT_SERVICE_URL',
    );
  }

  @All('ai/*')
  @UseGuards(JwtAuthGuard)
  async proxyAI(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(req, reply, 'AI_SERVICE_URL');
  }

  @All('comms/*')
  @UseGuards(JwtAuthGuard)
  async proxyComms(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(
      req,
      reply,
      'COMMUNICATION_SERVICE_URL',
    );
  }

  @All('audit/*')
  @UseGuards(JwtAuthGuard)
  async proxyAudit(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    return this.gatewayService.proxyRequest(req, reply, 'AUDIT_SERVICE_URL');
  }
}
