import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';
import type { AuthenticatedRequest } from './types/authenticated-request.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate with email/phone + password
   * Returns JWT access token and refresh token
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.login(loginDto, ip, userAgent);
  }

  /**
   * POST /auth/super-admin-login
   * Passwordless login for SUPER_ADMIN only
   * Allows super admin to login without entering password
   */
  @Public()
  @Post('super-admin-login')
  @HttpCode(HttpStatus.OK)
  async superAdminLogin(
    @Body() body: { email_or_phone: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.loginSuperAdmin(body.email_or_phone, ip, userAgent);
  }

  /**
   * GET /auth/profile
   * Get current authenticated user profile
   * Requires valid JWT token
   */
  @Get('profile')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.MANAGER,
    Role.CASHIER,
    Role.WAITER,
    Role.CHEF,
    Role.STOREKEEPER,
    Role.BARMAN,
    Role.DISPATCHER,
    Role.ACCOUNTANT,
    Role.HR,
  )
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.sub);
  }

  /**
   * PATCH /auth/profile
   * Update current authenticated user profile
   * Requires valid JWT token
   */
  @Patch('profile')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.MANAGER,
    Role.CASHIER,
    Role.WAITER,
    Role.CHEF,
    Role.STOREKEEPER,
    Role.BARMAN,
    Role.DISPATCHER,
    Role.ACCOUNTANT,
    Role.HR,
  )
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: { full_name?: string; email?: string; phone?: string },
  ) {
    return this.authService.updateProfile(req.user.sub, updateDto);
  }

  /**
   * POST /auth/change-password
   * Change user password
   * Requires valid JWT token and current password
   */
  @Post('change-password')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.MANAGER,
    Role.CASHIER,
    Role.WAITER,
    Role.CHEF,
    Role.STOREKEEPER,
    Role.BARMAN,
    Role.DISPATCHER,
    Role.ACCOUNTANT,
    Role.HR,
  )
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body()
    changePasswordDto: { current_password: string; new_password: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.current_password,
      changePasswordDto.new_password,
      ip,
      userAgent,
    );
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   * Returns new access token and refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.refreshToken(refreshTokenDto, ip, userAgent);
  }

  /**
   * POST /auth/forgot-password
   * Initiate password reset flow
   * Sends reset link to user's email (or logs token in dev mode)
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto, ip, userAgent);
  }

  /**
   * POST /auth/reset-password
   * Complete password reset with reset token
   * Sets new password for user
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.resetPassword(resetPasswordDto, ip, userAgent);
  }

  /**
   * POST /auth/logout
   * Logout current user
   * Revokes all refresh tokens
   */
  @Post('logout')
  @Roles(
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.MANAGER,
    Role.CASHIER,
    Role.WAITER,
    Role.CHEF,
    Role.STOREKEEPER,
    Role.BARMAN,
    Role.DISPATCHER,
    Role.ACCOUNTANT,
    Role.HR,
  )
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: AuthenticatedRequest,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.logout(req.user.sub, ip, userAgent);
  }
}
