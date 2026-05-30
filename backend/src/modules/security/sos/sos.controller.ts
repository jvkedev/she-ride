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
import { NotFoundException } from '@nestjs/common';
import { SosService } from './sos.service';
import { SosTriggerType, EmergencyType } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('security/sos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SosController {
  constructor(
    private readonly sosService: SosService,
    private readonly prisma: PrismaService,
  ) {}

  // POST /security/sos/trigger
  // Rider or captain triggers SOS (captain: linked via active ride rider)
  @Post('trigger')
  @Roles('RIDER', 'CAPTAIN')
  async triggerSos(
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
    let riderId: string | null = null;

    if (req.user.role === 'RIDER') {
      const rider = await this.prisma.rider.findUnique({
        where: { userId: req.user.id },
      });
      if (!rider) throw new NotFoundException('Rider profile not found');
      riderId = rider.id;
    } else if (req.user.role === 'CAPTAIN') {
      const captain = await this.prisma.captain.findUnique({
        where: { userId: req.user.id },
      });
      if (!captain) throw new NotFoundException('Captain profile not found');

      const ride = body.rideId
        ? await this.prisma.ride.findFirst({
            where: { id: body.rideId, captainId: captain.id },
          })
        : await this.prisma.ride.findFirst({
            where: {
              captainId: captain.id,
              status: { in: ['ACCEPTED', 'ARRIVING', 'IN_PROGRESS'] },
            },
            orderBy: { updatedAt: 'desc' },
          });

      if (!ride?.riderId) {
        throw new NotFoundException('No active ride to attach SOS');
      }
      riderId = ride.riderId;
    }

    if (!riderId) {
      throw new NotFoundException('Could not resolve rider for SOS');
    }

    return this.sosService.triggerSos(riderId, body);
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
