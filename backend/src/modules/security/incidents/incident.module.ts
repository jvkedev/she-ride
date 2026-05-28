import { Module } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { IncidentController } from './incident.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { IncidentListener } from './events/incident.listener';
import { SlaCheckerService } from './events/sla-checker.service';
import { SosIncidentBridgeListener } from './events/sos-incident-bridge.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [IncidentController],
  providers: [
    IncidentService,
    IncidentListener,
    SlaCheckerService,
    SosIncidentBridgeListener,
  ],
  exports: [IncidentService],
})
export class IncidentModule {}
