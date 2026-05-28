import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/revenue-chart')
  getRevenueChart() {
    return this.adminService.getRevenueChart();
  }

  @Get('dashboard/ride-trends')
  getRideTrends() {
    return this.adminService.getRideTrends();
  }

  @Get('dashboard/recent-rides')
  getRecentRides(@Query('limit') limit?: string) {
    return this.adminService.getRecentRides(limit ? +limit : 10);
  }

  @Get('dashboard/activity-feed')
  getActivityFeed(@Query('limit') limit?: string) {
    return this.adminService.getActivityFeed(limit ? +limit : 15);
  }

  // ── Riders ────────────────────────────────────────────────────────────────

  @Get('riders')
  getRiders() {
    return this.adminService.getRiders();
  }

  @Patch('riders/:id/block')
  blockRider(@Param('id') id: string) {
    return this.adminService.blockRider(id);
  }

  @Patch('riders/:id/unblock')
  unblockRider(@Param('id') id: string) {
    return this.adminService.unblockRider(id);
  }

  // ── Captains/Drivers ──────────────────────────────────────────────────────

  @Get('captains')
  getCaptains() {
    return this.adminService.getCaptains();
  }

  // ── Rides ─────────────────────────────────────────────────────────────────

  @Get('rides')
  getAllRides() {
    return this.adminService.getAllRides();
  }
}
