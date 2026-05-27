import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IncidentService } from './incident.service';
import { IncidentType, IncidentSeverity, IncidentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @Roles('RIDER', 'CAPTAIN', 'SECURITY', 'ADMIN')
  create(
    @Request() req,
    @Body()
    body: {
      incidentType: IncidentType;
      severity: IncidentSeverity;
      description: string;
      rideId?: string;
      evidence?: Record<string, any>;
      latitude?: number;
      longitude?: number;
      address?: string;
    },
  ) {
    return this.incidentService.createIncident({
      ...body,
      reportedBy: req.user.id,
    });
  }

  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.incidentService.getIncidentStats();
  }

  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(
    @Query('status') status?: IncidentStatus,
    @Query('severity') severity?: IncidentSeverity,
  ) {
    return this.incidentService.getAllIncidents({ status, severity });
  }

  @Get(':id')
  @Roles('SECURITY', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.incidentService.getIncidentById(id);
  }

  @Patch(':id/assign')
  @Roles('SECURITY', 'ADMIN')
  assign(@Param('id') id: string, @Request() req) {
    return this.incidentService.assignIncident(id, req.user.id);
  }

  @Patch(':id/resolve')
  @Roles('SECURITY', 'ADMIN')
  resolve(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      status: 'RESOLVED' | 'CLOSED';
      resolutionNote?: string;
    },
  ) {
    return this.incidentService.resolveIncident(id, req.user.id, body);
  }
}
