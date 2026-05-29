import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * Creates a new Tenant and the first admin User in a transaction.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/v1/auth/login
   * Validates credentials (+ optional MFA TOTP code), returns access + refresh tokens.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/refresh
   * Rotates the refresh token and issues a fresh access token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  /**
   * POST /api/v1/auth/logout
   * Revokes the provided refresh token.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Initiates a password-reset flow (sends email event via event bus).
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  /**
   * POST /api/v1/auth/reset-password
   * Completes the password reset using a reset token.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  /**
   * POST /api/v1/auth/verify-mfa
   * Verifies a TOTP code and enables MFA for the user.
   */
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  verifyMfa(
    @Body('userId') userId: string,
    @Body('mfaCode') mfaCode: string,
  ) {
    return this.authService.verifyAndEnableMfa(userId, mfaCode);
  }
}
