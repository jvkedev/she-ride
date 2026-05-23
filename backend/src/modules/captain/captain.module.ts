import { Module } from '@nestjs/common';
import { CaptainController } from './captain.controller';

@Module({
  controllers: [CaptainController]
})
export class CaptainModule {}
