import { Module } from '@nestjs/common';
import { SosService } from './sos.service';
import { SosController } from './sos.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { GatewayModule } from '../../gateway/gateway.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, GatewayModule, RedisModule],
  controllers: [SosController],
  providers: [SosService],
  exports: [SosService],
})
export class SosModule {}
