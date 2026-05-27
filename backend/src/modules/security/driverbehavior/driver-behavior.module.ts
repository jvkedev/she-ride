import { Module } from '@nestjs/common';
import { DriverBehaviorController } from './driver-behavior.controller';
import { DriverBehaviorService } from './driver-behavior.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverBehaviorController],
  providers: [DriverBehaviorService],
  exports: [DriverBehaviorService],
})
export class DriverBehaviorModule {}
