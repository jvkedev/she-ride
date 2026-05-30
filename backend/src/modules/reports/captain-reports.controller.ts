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
import { CaptainReportsService } from './captain-reports.service';
import { CreateCaptainReportDto } from './dto/create-captain-report.dto';

@Controller('reports/captain')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CaptainReportsController {
  constructor(private readonly reportsService: CaptainReportsService) {}

  @Post()
  @Roles('RIDER')
  create(@Request() req, @Body() body: CreateCaptainReportDto) {
    return this.reportsService.createReport(req.user.id, body);
  }

  @Get('mine')
  @Roles('RIDER')
  mine(@Request() req) {
    return this.reportsService.getMyReports(req.user.id);
  }

  @Get('admin')
  @Roles('ADMIN', 'SECURITY')
  listAdmin(@Query('status') status?: string) {
    return this.reportsService.listForAdmin(status);
  }

  @Patch('admin/:id')
  @Roles('ADMIN', 'SECURITY')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNote?: string },
  ) {
    return this.reportsService.updateStatus(id, body.status, body.adminNote);
  }
}
