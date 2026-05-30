// admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, DocumentStatus, VehicleType } from '@prisma/client';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { UpdateCaptainDocumentDto } from './dto/update-captain-document.dto';
import type { Request } from 'express';

// Define a type for the authenticated user
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard/stats')
  @SkipThrottle()
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/revenue-chart')
  @SkipThrottle()
  async getRevenueChart() {
    return this.adminService.getRevenueChart();
  }

  @Get('dashboard/ride-trends')
  @SkipThrottle()
  async getRideTrends() {
    return this.adminService.getRideTrends();
  }

  @Get('dashboard/daily-revenue')
  @SkipThrottle()
  async getDailyRevenue() {
    return this.adminService.getPaymentsTrend();
  }

  @Get('dashboard/growth-chart')
  @SkipThrottle()
  async getGrowthChart() {
    return this.adminService.getGrowthChart();
  }

  @Get('dashboard/recent-rides')
  @SkipThrottle()
  async getRecentRides() {
    return this.adminService.getRecentRides();
  }

  @Get('dashboard/activity-feed')
  @SkipThrottle()
  async getActivityFeed() {
    return this.adminService.getActivityFeed();
  }

  @Get('operations/live')
  @SkipThrottle()
  @Roles(UserRole.ADMIN, UserRole.SECURITY)
  async getLiveOperations() {
    return this.adminService.getLiveOperations();
  }

  // Riders
  @Get('riders')
  @SkipThrottle()
  async getRiders() {
    return this.adminService.getRiders();
  }

  @Get('riders/:userId')
  @SkipThrottle()
  async getRiderById(@Param('userId') userId: string) {
    const rider = await this.adminService.getRiderById(userId);
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    return rider;
  }

  @Patch('riders/:userId/block')
  async blockRider(@Param('userId') userId: string) {
    return this.adminService.blockRider(userId);
  }

  @Patch('riders/:userId/unblock')
  async unblockRider(@Param('userId') userId: string) {
    return this.adminService.unblockRider(userId);
  }

  // Captains/Drivers (SECURITY can verify drivers)
  @Get('captains')
  @SkipThrottle()
  @Roles(UserRole.ADMIN, UserRole.SECURITY)
  async getCaptains() {
    return this.adminService.getCaptains();
  }

  @Get('captains/:captainId')
  @SkipThrottle()
  @Roles(UserRole.ADMIN, UserRole.SECURITY)
  async getCaptainById(@Param('captainId') captainId: string) {
    const captain = await this.adminService.getCaptainById(captainId);
    if (!captain) {
      throw new NotFoundException('Captain not found');
    }
    return captain;
  }

  @Patch('captains/:captainId/document')
  @Roles(UserRole.ADMIN, UserRole.SECURITY)
  async updateCaptainDocument(
    @Param('captainId') captainId: string,
    @Body() body: UpdateCaptainDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.adminService.updateCaptainDocument(
      captainId,
      body,
      req.user.id,
    );
    if (!result) {
      throw new NotFoundException('Captain or documents not found');
    }
    return result;
  }

  @Patch('captains/:captainId/block')
  async blockCaptain(@Param('captainId') captainId: string) {
    return this.adminService.blockCaptain(captainId);
  }

  @Patch('captains/:captainId/unblock')
  async unblockCaptain(@Param('captainId') captainId: string) {
    return this.adminService.unblockCaptain(captainId);
  }

  // Rides
  @Get('rides')
  @SkipThrottle()
  async getAllRides() {
    return this.adminService.getAllRides();
  }

  // Payments
  @Get('payments')
  @SkipThrottle()
  async getPayments() {
    return this.adminService.getPayments();
  }

  @Get('payments/trend')
  @SkipThrottle()
  async getPaymentsTrend() {
    return this.adminService.getPaymentsTrend();
  }

  // Profile
  @Get('profile')
  @SkipThrottle()
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.adminService.getProfile(userId);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateDto: UpdateAdminProfileDto,
  ) {
    const userId = req.user.id;
    return this.adminService.updateProfile(userId, updateDto);
  }

  @Post('profile/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfilePhoto(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    return this.adminService.updateProfilePhoto(userId, file);
  }

  // Settings
  @Get('settings/fare')
  @SkipThrottle()
  getFareSettings() {
    return this.adminService.getFareSettings();
  }

  @Patch('settings/fare')
  updateFareSettings(
    @Body()
    body: {
      rates: Array<{ vehicleType: VehicleType; base: number; perKm: number }>;
    },
  ) {
    return this.adminService.updateFareSettings(body.rates);
  }

  @Get('settings/roles')
  @SkipThrottle()
  getRoleStats() {
    return this.adminService.getRoleStats();
  }

  @Get('settings/org-options')
  @SkipThrottle()
  getOrgOptions() {
    return this.adminService.getOrganizationOptions();
  }

  @Get('team')
  @SkipThrottle()
  listAdminTeam() {
    return this.adminService.listAdminTeam();
  }
}
