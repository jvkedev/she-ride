import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RiskZoneService } from './riskzone.service';
import { RiskLevel } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/risk-zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskZoneController {
  constructor(private readonly riskZoneService: RiskZoneService) {}

  @Post()
  @Roles('SECURITY', 'ADMIN')
  create(
    @Request() req,
    @Body()
    body: {
      name: string;
      riskLevel: RiskLevel;
      centerLatitude: number;
      centerLongitude: number;
      radiusInMeters: number;
      description?: string;
    },
  ) {
    return this.riskZoneService.createRiskZone(req.user.id, body);
  }

  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(
    @Query('isActive') isActive?: string,
    @Query('riskLevel') riskLevel?: RiskLevel,
  ) {
    return this.riskZoneService.getAllRiskZones({
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      riskLevel,
    });
  }

  @Get('check-point')
  @Roles('SECURITY', 'ADMIN', 'RIDER', 'CAPTAIN')
  checkPoint(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    return this.riskZoneService.checkPointInRiskZone(
      parseFloat(latitude),
      parseFloat(longitude),
    );
  }

  @Get(':id')
  @Roles('SECURITY', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.riskZoneService.getRiskZoneById(id);
  }

  @Patch(':id')
  @Roles('SECURITY', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      riskLevel: RiskLevel;
      centerLatitude: number;
      centerLongitude: number;
      radiusInMeters: number;
      description: string;
      isActive: boolean;
    }>,
  ) {
    return this.riskZoneService.updateRiskZone(id, body);
  }

  @Delete(':id')
  @Roles('SECURITY', 'ADMIN')
  delete(@Param('id') id: string, @Request() req) {
    return this.riskZoneService.deleteRiskZone(id, req.user.id);
  }
}
