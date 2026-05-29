import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequest } from '../../common/types/request.type';
import type { JwtUser } from '../../common/types/jwt-user.type';
import { CaptainService } from './captain.service';

@Controller('captain')
export class CaptainController {
  constructor(private readonly captainService: CaptainService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Welcome Captain',
      user: req.user,
    };
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
