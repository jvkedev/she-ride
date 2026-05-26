import { Module } from '@nestjs/common';
import { RideGateway } from './ride.gateway';

@Module({
  providers: [RideGateway],
  exports: [RideGateway],
})
export class GatewayModule {}
