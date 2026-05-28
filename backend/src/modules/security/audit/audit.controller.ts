import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditAction } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.auditService.getAuditStats();
  }

  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(
    @Query('performedBy') performedBy?: string,
    @Query('action') action?: AuditAction,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getAllLogs({
      performedBy,
      action,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get(':entity/:entityId')
  @Roles('SECURITY', 'ADMIN')
  getByEntity(
    @Param('entity') entity: 'sos' | 'fraud' | 'incident' | 'account',
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getLogsByEntity(entity, entityId);
  }
}
