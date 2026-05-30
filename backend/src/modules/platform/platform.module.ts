import { Global, Module } from '@nestjs/common';

import { FareConfigService } from './fare-config.service';

@Global()
@Module({
  providers: [FareConfigService],
  exports: [FareConfigService],
})
export class PlatformModule {}
