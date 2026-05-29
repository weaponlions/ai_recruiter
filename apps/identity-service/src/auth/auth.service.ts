import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { totp } from 'otplib';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityPublisher } from '../events/identity.publisher';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly publisher: IdentityPublisher,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Check if email already exists globally (across tenants email must be unique per tenant)
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Create Tenant + first admin User in a single transaction
    const { tenant, user } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          plan: dto.plan ?? 'STARTER',
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          role: 'ADMIN',
        },
      });

      return { tenant, user };
    });

    // Publish event
    await this.publisher.publishTenantCreated(tenant, user);

    const tokens = await this.generateTokens(user.id, tenant.id, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
      tenant: { id: tenant.id, name: tenant.name, plan: tenant.plan },
    };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // MFA check — if user has MFA enabled and no code supplied, demand it
    if (user.mfaSecret) {
      if (!dto.mfaCode) {
        return { requiresMfa: true, userId: user.id };
      }
      const mfaValid = totp.verify({
        token: dto.mfaCode,
        secret: user.mfaSecret,
      });
      if (!mfaValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    const tokens = await this.generateTokens(user.id, user.tenantId, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────

  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const tokenHash = this.hashToken(rawRefreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !stored ||
      stored.revokedAt ||
      new Date() > stored.expiresAt
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const { user } = stored;
    const tokens = await this.generateTokens(user.id, user.tenantId, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    const tokenHash = this.hashToken(rawRefreshToken);

    await this.prisma.refreshToken
      .update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      })
      .catch(() => {
        // Token not found — silently ignore
      });
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    // Always return success to prevent user enumeration
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    // Publish event so notification service handles email delivery
    await this.publisher.publishPasswordResetRequested(user, resetToken);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────

  async resetPassword(token: string, newPassword: string) {
    // In production: validate token from a cache/DB (stored during forgotPassword)
    // For this scaffold we treat the token as a signed payload (simplified flow)
    if (!token || !newPassword) {
      throw new BadRequestException('Token and newPassword are required');
    }

    // Decode userId from token (in real impl verify HMAC signature)
    const userId = Buffer.from(token, 'hex').toString('utf8').split(':')[0];
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Invalid reset token');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Revoke all refresh tokens on password reset
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password reset successful' };
  }

  // ─── MFA ──────────────────────────────────────────────────────────────────

  async verifyAndEnableMfa(userId: string, mfaCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    const valid = totp.verify({ token: mfaCode, secret: user.mfaSecret });
    if (!valid) throw new UnauthorizedException('Invalid MFA code');

    return { message: 'MFA verified and enabled' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    tenantId: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign({
      sub: userId,
      tenantId,
      role,
    });

    // Generate a cryptographically random refresh token
    const rawRefreshToken = randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const refreshDays =
      parseInt(
        this.config.get<string>('REFRESH_EXPIRY', '7d').replace('d', ''),
        10,
      ) || 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    isActive: boolean;
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
    };
  }
}
