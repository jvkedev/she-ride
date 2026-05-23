import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import type { AuthenticatedRequest } from '../../common/types/request.type';

@Controller('rider')
export class RiderController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles('RIDER')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Welcome Rider',
      user: req.user,
    };
  }
}
