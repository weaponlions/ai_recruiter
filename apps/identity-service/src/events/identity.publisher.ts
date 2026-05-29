import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@hr-ai/event-bus';

/**
 * IdentityPublisher
 *
 * Publishes domain events from identity-service to the shared event bus (BullMQ + Redis).
 * Other microservices subscribe to these events to react (e.g., notification-service sends emails).
 */
@Injectable()
export class IdentityPublisher {
  private readonly logger = new Logger(IdentityPublisher.name);

  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Emitted when a new Tenant is registered.
   */
  async publishTenantCreated(
    tenant: { id: string; name: string; plan: string },
    adminUser: { id: string; email: string },
  ) {
    await this.safePublish('tenant.created', {
      tenantId: tenant.id,
      tenantName: tenant.name,
      plan: tenant.plan,
      adminUserId: adminUser.id,
      adminEmail: adminUser.email,
    });
  }

  /**
   * Emitted when a user is invited to a tenant.
   */
  async publishUserInvited(invite: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
    token: string;
    expiresAt: Date;
  }) {
    await this.safePublish('user.invited', {
      inviteId: invite.id,
      tenantId: invite.tenantId,
      email: invite.email,
      role: invite.role,
      inviteToken: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
    });
  }

  /**
   * Emitted when a user's role changes.
   */
  async publishRoleChanged(user: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
  }) {
    await this.safePublish('role.changed', {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      newRole: user.role,
    });
  }

  /**
   * Emitted when a password reset is requested.
   */
  async publishPasswordResetRequested(
    user: { id: string; email: string; tenantId: string },
    resetToken: string,
  ) {
    await this.safePublish('auth.password_reset_requested', {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      resetToken,
    });
  }

  private async safePublish(event: string, payload: Record<string, unknown>) {
    try {
      await this.eventBus.publish(event, payload);
      this.logger.log(`Published event: ${event}`);
    } catch (err: any) {
      // Non-critical — log and continue to avoid blocking the HTTP response
      this.logger.error(`Failed to publish event ${event}: ${err.message}`);
    }
  }
}
