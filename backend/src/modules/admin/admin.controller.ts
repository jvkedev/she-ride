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
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, DocumentStatus } from '@prisma/client';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
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
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/revenue-chart')
  async getRevenueChart() {
    return this.adminService.getRevenueChart();
  }

  @Get('dashboard/ride-trends')
  async getRideTrends() {
    return this.adminService.getRideTrends();
  }

  @Get('dashboard/recent-rides')
  async getRecentRides() {
    return this.adminService.getRecentRides();
  }

  @Get('dashboard/activity-feed')
  async getActivityFeed() {
    return this.adminService.getActivityFeed();
  }

  // Riders
  @Get('riders')
  async getRiders() {
    return this.adminService.getRiders();
  }

  @Patch('riders/:userId/block')
  async blockRider(@Param('userId') userId: string) {
    return this.adminService.blockRider(userId);
  }

  @Patch('riders/:userId/unblock')
  async unblockRider(@Param('userId') userId: string) {
    return this.adminService.unblockRider(userId);
  }

  // Captains/Drivers
  @Get('captains')
  async getCaptains() {
    return this.adminService.getCaptains();
  }

  @Get('captains/:captainId')
  async getCaptainById(@Param('captainId') captainId: string) {
    const captain = await this.adminService.getCaptainById(captainId);
    if (!captain) {
      throw new NotFoundException('Captain not found');
    }
    return captain;
  }

  @Patch('captains/:captainId/document')
  async updateCaptainDocument(
    @Param('captainId') captainId: string,
    @Body() body: { status: DocumentStatus; rejectionReason?: string },
  ) {
    const result = await this.adminService.updateCaptainDocument(
      captainId,
      body,
    );
    if (!result) {
      throw new NotFoundException('Captain or documents not found');
    }
    return result;
  }

  // Rides
  @Get('rides')
  async getAllRides() {
    return this.adminService.getAllRides();
  }

  // Payments
  @Get('payments')
  async getPayments() {
    return this.adminService.getPayments();
  }

  @Get('payments/trend')
  async getPaymentsTrend() {
    return this.adminService.getPaymentsTrend();
  }

  // Profile
  @Get('profile')
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
}
