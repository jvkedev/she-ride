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
import { FraudService } from './fraud.service';
import { FraudType, FraudRiskLevel, FraudStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/fraud')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  // POST /security/fraud/signal
  // System / internal service ingests a raw fraud signal
  @Post('signal')
  @Roles('SECURITY', 'ADMIN')
  ingestSignal(
    @Body()
    body: {
      userId: string;
      signalType: string;
      payload: Record<string, any>;
      score: number;
    },
  ) {
    return this.fraudService.ingestSignal(body);
  }

  // POST /security/fraud/flag
  // System flags a fraud case after ML scoring
  @Post('flag')
  @Roles('SECURITY', 'ADMIN')
  flagCase(
    @Body()
    body: {
      userId: string;
      fraudType: FraudType;
      riskLevel: FraudRiskLevel;
      fraudScore: number;
      description?: string;
      evidence?: Record<string, any>;
      rideId?: string;
    },
  ) {
    return this.fraudService.flagFraudCase(body);
  }

  // GET /security/fraud/stats
  // Overview card counts
  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.fraudService.getFraudStats();
  }

  // GET /security/fraud?status=OPEN&riskLevel=HIGH
  // Ops fraud queue with optional filters
  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(
    @Query('status') status?: FraudStatus,
    @Query('riskLevel') riskLevel?: FraudRiskLevel,
  ) {
    return this.fraudService.getAllFraudCases({ status, riskLevel });
  }

  // GET /security/fraud/:id
  // Full detail of a single fraud case
  @Get(':id')
  @Roles('SECURITY', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.fraudService.getFraudCaseById(id);
  }

  // GET /security/fraud/user/:userId/signals
  // All raw fraud signals for a user
  @Get('user/:userId/signals')
  @Roles('SECURITY', 'ADMIN')
  getUserSignals(@Param('userId') userId: string) {
    return this.fraudService.getUserSignals(userId);
  }

  // PATCH /security/fraud/:id/status
  // Ops updates case status (review / resolve / false positive)
  @Patch(':id/status')
  @Roles('SECURITY', 'ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      status: 'UNDER_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
      resolutionNote?: string;
    },
  ) {
    return this.fraudService.updateFraudCase(id, req.user.id, body);
  }

  // PATCH /security/fraud/:id/block-user
  // Ops blocks the user tied to a fraud case
  @Patch(':id/block-user')
  @Roles('SECURITY', 'ADMIN')
  blockUser(@Param('id') id: string, @Request() req) {
    return this.fraudService.blockUserFromFraudCase(id, req.user.id);
  }
}
