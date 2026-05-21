import { Module } from '@nestjs/common';
import { OtpModule } from '../otp/otp.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule, OtpModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
