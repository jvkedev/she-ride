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

  @Post('estimate')
  async estimateRide(@Body() dto: EstimateRideDto, @Request() req) {
    return this.ridesService.estimateRide(dto, req.user.id);
  }

  @Post('request')
  async requestRide(@Body() dto: CreateRideDto, @Request() req) {
    return this.ridesService.requestRide(dto, req.user.id);
  }

  @Get('searching')
  async getSearchingRides(@Request() req) {
    return this.ridesService.getSearchingRides(req.user.id);
  }

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
}
