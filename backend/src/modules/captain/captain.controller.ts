import {
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.type';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { CaptainService } from './captain.service';
import { UpdateCaptainProfileDto } from './dto/update-captain-profile.dto';

@Controller('captain')
export class CaptainController {
  constructor(private readonly captainService: CaptainService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return { message: 'Welcome Captain', user: req.user };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  getProfile(@CurrentUser() user: JwtUser) {
    return this.captainService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateCaptainProfileDto,
  ) {
    return this.captainService.updateProfile(user.id, dto);
  }

  @Post('profile/photo')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  @UseInterceptors(FileInterceptor('photo')) // was 'file', now matches frontend
  async uploadPhoto(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ profileImage: string }> {
    return this.captainService.updateProfilePhoto(user.id, file);
  }

  @Get('documents')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  getDocuments(@CurrentUser() user: JwtUser) {
    return this.captainService.getDocuments(user.id);
  }

  @Get('earnings')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  getEarnings(@CurrentUser() user: JwtUser) {
    return this.captainService.getEarnings(user.id);
  }
}
