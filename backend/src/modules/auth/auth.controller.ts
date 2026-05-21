import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import {
  registerSchema,
  verifyRegisterOtpSchema,
  type RegisterDto,
  type VerifyRegisterOtpDto,
} from './dto/register.dto';

import {
  sendLoginOtpSchema,
  verifyLoginOtpSchema,
  type SendLoginOtpDto,
  type VerifyLoginOtpDto,
} from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
