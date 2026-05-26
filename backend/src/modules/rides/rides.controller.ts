import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { EstimateRideDto } from './dto/estimate-ride.dto';
import { Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/jwt-user.type';
import type { HistoryQueryDto } from './dto/history-ride.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  // POST routes
  @Post('estimate')
  async estimateRide(@Body() dto: EstimateRideDto, @Request() req) {
    return this.ridesService.estimateRide(dto, req.user.id);
  }

  @Post('request')
  async requestRide(@Body() dto: CreateRideDto, @Request() req) {
    return this.ridesService.requestRide(dto, req.user.id);
  }

  @Get(':id/details')
  async getRideDetails(@Param('id') rideId: string, @Request() req) {
    return this.ridesService.getRideDetails(rideId, req.user.id);
  }

  @Patch(':id/cancel')
  async cancelRide(
    @Param('id') rideId: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.ridesService.cancelRide(rideId, req.user.id, reason);
  }

  // GET static routes
  @Get('searching')
  async getSearchingRides(@Request() req) {
    return this.ridesService.getSearchingRides(req.user.id);
  }

  // Add these two routes — IMPORTANT: place them BEFORE /:id routes

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getRiderHistory(
    @CurrentUser() user: JwtUser,
    @Query() query: HistoryQueryDto,
  ) {
    return this.ridesService.getRiderHistory(user.id, query);
  }

  @Get('history/captain')
  @UseGuards(JwtAuthGuard)
  getCaptainHistory(
    @CurrentUser() user: JwtUser,
    @Query() query: HistoryQueryDto,
  ) {
    return this.ridesService.getCaptainHistory(user.id, query);
  }

  // PATCH static routes — BEFORE any :id routes
  @Patch('location')
  async updateLocation(
    @Body('lat') lat: number,
    @Body('lng') lng: number,
    @Request() req,
  ) {
    return this.ridesService.updateLocation(req.user.id, lat, lng);
  }

  // Dynamic :id routes — ALWAYS LAST
  @Patch(':id/accept')
  async acceptRide(@Param('id') rideId: string, @Request() req) {
    return this.ridesService.acceptRide(rideId, req.user.id);
  }

  @Patch(':id/arrived')
  async captainArrived(@Param('id') rideId: string, @Request() req) {
    return this.ridesService.captainArrived(rideId, req.user.id);
  }

  @Patch(':id/start')
  @Throttle({ default: { ttl: 600_000, limit: 5 } })
  async startRide(
    @Param('id') rideId: string,
    @Body('otp') otp: string,
    @Request() req,
  ) {
    return this.ridesService.startRide(rideId, req.user.id, otp);
  }

  @Patch(':id/complete')
  async completeRide(@Param('id') rideId: string, @Request() req) {
    return this.ridesService.completeRide(rideId, req.user.id);
  }

  @Get(':rideId/captain-location')
  async getCaptainLocation(@Param('rideId') rideId: string, @Request() req) {
    return this.ridesService.getCaptainLocation(rideId, req.user.id);
  }
}
