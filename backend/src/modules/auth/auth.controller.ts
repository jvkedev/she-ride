import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { SkipThrottle } from '@nestjs/throttler';

import {
  registerSchema,
  verifyRegisterOtpSchema,
  type RegisterDto,
  type VerifyRegisterOtpDto,
} from './dto/register.dto';

import {
  refreshTokenSchema,
  type RefreshTokenDto,
} from './dto/refresh-token.dto';

import {
  sendLoginOtpSchema,
  verifyLoginOtpSchema,
  type SendLoginOtpDto,
  type VerifyLoginOtpDto,
} from './dto/login.dto';

import { selectRoleSchema, type SelectRoleDto } from './dto/select-role.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-otp')
  @SkipThrottle()
  async testOtp() {
    const numbers = ['9045499732', '9266540690', '8171340519'];

    for (const phoneNumber of numbers) {
      await this.authService.sendLoginOtp({
        phoneNumber,
      } as SendLoginOtpDto);
    }

    return { success: true };
  }

  @Post('register/send-otp')
  @UsePipes(new ZodValidationPipe(registerSchema))
  sendRegisterOtp(@Body() dto: RegisterDto) {
    return this.authService.sendRegisterOtp(dto);
  }

  @Post('register/verify-otp')
  @UsePipes(new ZodValidationPipe(verifyRegisterOtpSchema))
  verifyRegisterOtp(@Body() dto: VerifyRegisterOtpDto) {
    return this.authService.verifyRegisterOtp(dto);
  }

  @Post('login/send-otp')
  @UsePipes(new ZodValidationPipe(sendLoginOtpSchema))
  sendLoginOtp(@Body() dto: SendLoginOtpDto) {
    return this.authService.sendLoginOtp(dto);
  }

  @Post('login/verify-otp')
  @UsePipes(new ZodValidationPipe(verifyLoginOtpSchema))
  verifyLoginOtp(@Body() dto: VerifyLoginOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }

  @Post('refresh')
  @SkipThrottle()
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtUser) {
    return this.authService.getMe(user.id);
  }

  @Post('select-role')
  @UseGuards(JwtAuthGuard)
  selectRole(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(selectRoleSchema)) dto: SelectRoleDto,
  ) {
    return this.authService.selectRole(user.id, dto);
  }
}
