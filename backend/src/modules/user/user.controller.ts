import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/request.type';

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
