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
import { DriverBehaviorService } from './driver-behavior.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/driver-behavior')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriverBehaviorController {
  constructor(private readonly driverBehaviorService: DriverBehaviorService) {}

  @Post()
  @Roles('SECURITY', 'ADMIN')
  create(
    @Body()
    body: {
      captainId: string;
      flagType: string;
      severity: string;
      description?: string;
      rideId?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.driverBehaviorService.createFlag(body);
  }

  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.driverBehaviorService.getBehaviorStats();
  }

  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(
    @Query('captainId') captainId?: string,
    @Query('severity') severity?: string,
    @Query('isReviewed') isReviewed?: string,
  ) {
    return this.driverBehaviorService.getAllFlags({
      captainId,
      severity,
      isReviewed: isReviewed !== undefined ? isReviewed === 'true' : undefined,
    });
  }

  @Get('captain/:captainId/summary')
  @Roles('SECURITY', 'ADMIN')
  getCaptainSummary(@Param('captainId') captainId: string) {
    return this.driverBehaviorService.getCaptainBehaviorSummary(captainId);
  }

  @Get(':id')
  @Roles('SECURITY', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.driverBehaviorService.getFlagById(id);
  }

  @Patch(':id/review')
  @Roles('SECURITY', 'ADMIN')
  review(@Param('id') id: string, @Request() req) {
    return this.driverBehaviorService.reviewFlag(id, req.user.id);
  }
}
