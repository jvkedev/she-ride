import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import type { AuthenticatedRequest } from '../../common/types/request.type';

@Controller('captain')
export class CaptainController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles('CAPTAIN')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Welcome Captain',
      user: req.user,
    };
  }
}
