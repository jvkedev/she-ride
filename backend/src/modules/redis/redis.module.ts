import { Global, Module } from '@nestjs/common';

import { RideRedisService } from './ride-redis.service';

@Global()
@Module({
  providers: [RideRedisService],
  exports: [RideRedisService],
})
export class RedisModule {}
