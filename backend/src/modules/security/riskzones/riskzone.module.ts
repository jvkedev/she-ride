import { Module } from '@nestjs/common';
import { RiskZoneService } from './riskzone.service';
import { RiskZoneController } from './riskzone.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiskZoneController],
  providers: [RiskZoneService],
  exports: [RiskZoneService],
})
export class RiskZoneModule {}
