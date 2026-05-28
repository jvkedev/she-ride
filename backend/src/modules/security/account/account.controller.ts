import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountSecurityService } from './account.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('security/accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountSecurityController {
  constructor(private readonly accountService: AccountSecurityService) {}

  @Post('flag')
  @Roles('SECURITY', 'ADMIN')
  flag(
    @Request() req,
    @Body()
    body: {
      userId: string;
      reasons: string[];
      riskScore: number;
      notes?: string;
    },
  ) {
    return this.accountService.flagSuspiciousAccount({
      ...body,
      flaggedBy: req.user.id,
    });
  }

  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.accountService.getAccountStats();
  }

  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(@Query('isResolved') isResolved?: string) {
    return this.accountService.getAllSuspiciousAccounts({
      isResolved: isResolved !== undefined ? isResolved === 'true' : undefined,
    });
  }

  @Get(':id')
  @Roles('SECURITY', 'ADMIN')
  getById(@Param('id') id: string) {
    return this.accountService.getSuspiciousAccountById(id);
  }

  @Patch(':id/resolve')
  @Roles('SECURITY', 'ADMIN')
  resolve(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { notes?: string },
  ) {
    return this.accountService.resolveFlag(id, req.user.id, body.notes);
  }

  @Get('assignees')
  @Roles('SECURITY', 'ADMIN')
  getAssignees() {
    return this.accountService.getAssignees();
  }

  @Patch('user/:userId/block')
  @Roles('SECURITY', 'ADMIN')
  block(@Param('userId') userId: string, @Request() req) {
    return this.accountService.blockUser(userId, req.user.id);
  }

  @Patch('user/:userId/unblock')
  @Roles('SECURITY', 'ADMIN')
  unblock(@Param('userId') userId: string, @Request() req) {
    return this.accountService.unblockUser(userId, req.user.id);
  }
}
