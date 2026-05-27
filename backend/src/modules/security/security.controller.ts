import { Controller, Get, UseGuards } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecurityController {
  @Get('fraud')
  @Roles(UserRole.SECURITY, UserRole.ADMIN)
  getFraudCases() {
    return {
      message: 'Fraud cases fetched successfully',
    };
  }

  @Get('fraud/stats')
  @Roles(UserRole.SECURITY, UserRole.ADMIN)
  getFraudStats() {
    return {
      totalCases: 10,
      resolvedCases: 7,
      pendingCases: 3,
    };
  }
}
