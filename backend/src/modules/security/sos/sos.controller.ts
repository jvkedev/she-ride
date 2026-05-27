import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SosService } from './sos.service';
import { SosTriggerType, EmergencyType } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/sos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(private readonly sosService: SosService) {}

  // POST /security/sos/trigger
  // Rider triggers SOS
  @Post('trigger')
  @Roles('RIDER')
  triggerSos(
    @Request() req,
    @Body()
    body: {
      triggerType: SosTriggerType;
      latitude: number;
      longitude: number;
      address?: string;
      rideId?: string;
    },
  ) {
    return this.sosService.triggerSos(req.user.riderId, body);
  }

  // POST /security/sos/:id/location
  // Rider pushes live GPS snapshot during active SOS
  @Post(':id/location')
  @Roles('RIDER')
  pushLocation(
    @Param('id') id: string,
    @Body()
    body: {
      latitude: number;
      longitude: number;
    },
  ) {
    return this.sosService.pushLocationSnapshot(id, body);
  }

  // GET /security/sos/active
  // Ops sees all active SOS alerts
  @Get('active')
  @Roles('SECURITY', 'ADMIN')
  getActive() {
    return this.sosService.getActiveSosAlerts();
  }

  // GET /security/sos/stats
  // Overview card counts for dashboard
  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.sosService.getSosStats();
  }

  // GET /security/sos/:id
  // Full detail of a single SOS alert
  @Get(':id')
  @Roles('SECURITY', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.sosService.getSosById(id);
  }

  // GET /security/sos/rider/:riderId/history
  // All past SOS alerts for a rider
  @Get('rider/:riderId/history')
  @Roles('SECURITY', 'ADMIN')
  getRiderHistory(@Param('riderId') riderId: string) {
    return this.sosService.getRiderSosHistory(riderId);
  }

  // PATCH /security/sos/:id/resolve
  // Ops resolves or marks false alarm
  @Patch(':id/resolve')
  @Roles('SECURITY', 'ADMIN')
  resolve(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      status: 'RESOLVED' | 'FALSE_ALARM';
      resolutionNote?: string;
    },
  ) {
    return this.sosService.resolveSos(id, req.user.id, body);
  }

  // POST /security/sos/:id/dispatch
  // Ops dispatches police / ambulance / fire
  @Post(':id/dispatch')
  @Roles('SECURITY', 'ADMIN')
  dispatch(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      emergencyType: EmergencyType;
      notes?: string;
    },
  ) {
    return this.sosService.dispatchEmergency(id, req.user.id, body);
  }
}
