import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SecurityDashboardService } from './security-dashboard.service';

@Controller('security/overview')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SECURITY, UserRole.ADMIN)
export class SecurityDashboardController {
  constructor(private readonly dashboardService: SecurityDashboardService) {}

  @Get('stats')
  @SkipThrottle()
  getStats() {
    return this.dashboardService.getOverviewStats();
  }

  @Get('alerts-trend')
  @SkipThrottle()
  getAlertsTrend() {
    return this.dashboardService.getAlertsTrend();
  }
}
