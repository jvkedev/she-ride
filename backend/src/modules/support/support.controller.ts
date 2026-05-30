import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SupportService } from './support.service';
import { SupportTicketCategory, SupportTicketStatus } from '@prisma/client';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @Roles('RIDER')
  create(
    @Request() req,
    @Body()
    body: {
      category: SupportTicketCategory;
      subject: string;
      description: string;
      rideId?: string;
    },
  ) {
    return this.supportService.createTicket(req.user.id, body);
  }

  @Get('tickets')
  @Roles('RIDER')
  myTickets(@Request() req) {
    return this.supportService.getMyTickets(req.user.id);
  }

  @Get('tickets/:id')
  @Roles('RIDER')
  getOne(@Request() req, @Param('id') id: string) {
    return this.supportService.getTicket(req.user.id, id);
  }

  @Get('admin/tickets')
  @Roles('ADMIN', 'SECURITY')
  adminList(@Query('status') status?: string) {
    return this.supportService.listForAdmin(status);
  }

  @Get('admin/tickets/:id')
  @Roles('ADMIN', 'SECURITY')
  adminGetOne(@Param('id') id: string) {
    return this.supportService.getTicketForAdmin(id);
  }

  @Patch('admin/tickets/:id')
  @Roles('ADMIN', 'SECURITY')
  adminUpdate(
    @Param('id') id: string,
    @Body() body: { status?: SupportTicketStatus; adminResponse?: string },
  ) {
    return this.supportService.updateTicketForAdmin(id, body);
  }
}
