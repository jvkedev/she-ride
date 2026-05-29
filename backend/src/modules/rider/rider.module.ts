import { Module } from '@nestjs/common';
import { RiderController } from './rider.controller';
import { PaymentController } from './payments/payment.controller';
import { PaymentService } from './payments/payment.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiderController, PaymentController],
  providers: [PaymentService],
})
export class RiderModule {}
