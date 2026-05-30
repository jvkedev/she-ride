import { Module } from '@nestjs/common';
import { SosModule } from './sos/sos.module';
import { FraudModule } from './fraud/fraud.module';
import { IncidentModule } from './incidents/incident.module';
import { AccountSecurityModule } from './account/account.module';
import { DriverBehaviorModule } from './driverbehavior/driver-behavior.module';
import { AuditModule } from './audit/audit.module';
import { SecurityProfileModule } from './profile/security-profile.module';
import { SecurityDashboardModule } from './dashboard/security-dashboard.module';

@Module({
  imports: [
    SosModule,
    FraudModule,
    IncidentModule,
    AccountSecurityModule,
    DriverBehaviorModule,
    AuditModule,
    SecurityProfileModule,
    SecurityDashboardModule,
  ],
})
export class SecurityModule {}
