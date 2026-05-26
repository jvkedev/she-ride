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

  // GET static routes
  @Get('searching')
  async getSearchingRides(@Request() req) {
    return this.ridesService.getSearchingRides(req.user.id);
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
