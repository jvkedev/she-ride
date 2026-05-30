import { Module } from '@nestjs/common';
import { RideGateway } from './ride.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RideGateway],
  exports: [RideGateway],
})
export class GatewayModule {}
