import { Module } from '@nestjs/common';
import { SosModule } from './sos/sos.module';
import { FraudModule } from './fraud/fraud.module';
import { IncidentModule } from './incidents/incident.module';
import { AccountSecurityModule } from './account/account.module';
import { RiskZoneModule } from './riskzones/riskzone.module';
import { DriverBehaviorModule } from './driverbehavior/driver-behavior.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    SosModule,
    FraudModule,
    IncidentModule,
    AccountSecurityModule,
    RiskZoneModule,
    DriverBehaviorModule,
    AuditModule,
  ],
})
export class SecurityModule {}
