import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';
import { SecurityDashboardController } from './security-dashboard.controller';
import { SecurityDashboardService } from './security-dashboard.service';

@Module({
  imports: [PrismaModule],
  controllers: [SecurityDashboardController],
  providers: [SecurityDashboardService],
})
export class SecurityDashboardModule {}
