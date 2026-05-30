import {

  Controller,

  Get,

  Patch,

  Post,

  Req,

  Body,

  Param,

  UseGuards,

  UseInterceptors,

  UploadedFile,

} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';



import { SkipThrottle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import type { AuthenticatedRequest } from '../../common/types/request.type';

import type { JwtUser } from '../../common/types/jwt-user.type';

import { CaptainService } from './captain.service';

import { UpdateCaptainProfileDto } from './dto/update-captain-profile.dto';



@Controller('captain')

@UseGuards(JwtAuthGuard, RolesGuard)

@Roles('CAPTAIN')

export class CaptainController {

  constructor(private readonly captainService: CaptainService) {}



  @Get('dashboard')
  @SkipThrottle()
  getDashboard(@CurrentUser() user: JwtUser) {

    return this.captainService.getDashboard(user.id);

  }



  @Get('profile')
  @SkipThrottle()
  getProfile(@CurrentUser() user: JwtUser) {

    return this.captainService.getProfile(user.id);

  }



  @Patch('profile')

  updateProfile(

    @CurrentUser() user: JwtUser,

    @Body() dto: UpdateCaptainProfileDto,

  ) {

    return this.captainService.updateProfile(user.id, dto);

  }



  @Post('profile/photo')

  @UseInterceptors(FileInterceptor('photo'))

  async uploadPhoto(

    @CurrentUser() user: JwtUser,

    @UploadedFile() file: Express.Multer.File,

  ): Promise<{ profileImage: string }> {

    return this.captainService.updateProfilePhoto(user.id, file);

  }



  @Get('documents')
  @SkipThrottle()
  getDocuments(@CurrentUser() user: JwtUser) {

    return this.captainService.getDocuments(user.id);

  }

  @Post('documents/:type')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @CurrentUser() user: JwtUser,
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.captainService.uploadDocument(user.id, type, file);
  }



  @Get('earnings')
  @SkipThrottle()
  getEarnings(@CurrentUser() user: JwtUser) {

    return this.captainService.getEarnings(user.id);

  }



  @Patch('online')
  setOnline(
    @CurrentUser() user: JwtUser,
    @Body('isOnline') isOnline: boolean,
  ) {
    return this.captainService.setOnlineStatus(user.id, Boolean(isOnline));
  }

  @Post('support/inquiry')
  createSupportInquiry(
    @CurrentUser() user: JwtUser,
    @Body()
    body: { subject: string; description: string; category?: string },
  ) {
    return this.captainService.createSupportInquiry(user.id, body);
  }
}
