import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipThrottle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UpdateSecurityProfileDto } from './dto/update-security-profile.dto';
import { SecurityProfileService } from './security-profile.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: UserRole };
}

@Controller('security/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SECURITY, UserRole.ADMIN)
export class SecurityProfileController {
  constructor(private readonly profileService: SecurityProfileService) {}

  @Get()
  @SkipThrottle()
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateSecurityProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('photo'))
  updateProfilePhoto(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.updateProfilePhoto(req.user.id, file);
  }
}
