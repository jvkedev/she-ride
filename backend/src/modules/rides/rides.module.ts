import { Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpModule } from '../otp/otp.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [OtpModule, GatewayModule],
  controllers: [RidesController],
  providers: [RidesService, PrismaService],
  exports: [RidesService],
})
export class RidesModule {}
