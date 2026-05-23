import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import type { AuthenticatedRequest } from '../../common/types/request.type';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Welcome Admin',
      user: req.user,
    };
  }
}
