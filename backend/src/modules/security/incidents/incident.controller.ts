import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Ip,
} from '@nestjs/common';
import { IncidentService } from './incident.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateIncidentDto } from './dto/create-incident.dto';
import {
  UpdateIncidentStatusDto,
  AssignIncidentDto,
  UpdateIncidentPriorityDto,
} from './dto/update-incident.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';

@Controller('security/incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  // ── Submit incident (any authenticated role) ─────────────────────────────

  @Post()
  @Roles('RIDER', 'CAPTAIN', 'SECURITY', 'ADMIN')
  create(@Request() req, @Body() dto: CreateIncidentDto, @Ip() ip: string) {
    return this.incidentService.createIncident(
      dto,
      req.user.id,
      req.user.role,
      'APP',
      ip,
    );
  }

  // ── Stats (security/admin only) ──────────────────────────────────────────

  @Get('stats')
  @Roles('SECURITY', 'ADMIN')
  getStats() {
    return this.incidentService.getIncidentStats();
  }

  // ── List all — paginated (security/admin only) ───────────────────────────

  @Get()
  @Roles('SECURITY', 'ADMIN')
  getAll(@Query() query: QueryIncidentsDto) {
    return this.incidentService.getAllIncidents(query);
  }

  // ── Get single incident ──────────────────────────────────────────────────

  @Get(':id')
  @Roles('RIDER', 'CAPTAIN', 'SECURITY', 'ADMIN')
  getById(@Param('id') id: string, @Request() req) {
    return this.incidentService.getIncidentById(id, req.user.id, req.user.role);
  }

  // ── Timeline (security/admin only) ──────────────────────────────────────

  @Get(':id/timeline')
  @Roles('SECURITY', 'ADMIN')
  getTimeline(@Param('id') id: string) {
    return this.incidentService.getTimeline(id);
  }

  // ── Assign to a specific agent ───────────────────────────────────────────

  @Patch(':id/assign')
  @Roles('SECURITY', 'ADMIN')
  assign(
    @Param('id') id: string,
    @Body() dto: AssignIncidentDto,
    @Request() req,
  ) {
    return this.incidentService.assignIncident(id, dto, req.user.id);
  }

  // ── Update status ────────────────────────────────────────────────────────

  @Patch(':id/status')
  @Roles('SECURITY', 'ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
    @Request() req,
    @Ip() ip: string,
  ) {
    return this.incidentService.updateStatus(id, dto, req.user.id, ip);
  }

  // ── Update priority ──────────────────────────────────────────────────────

  @Patch(':id/priority')
  @Roles('SECURITY', 'ADMIN')
  updatePriority(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentPriorityDto,
    @Request() req,
  ) {
    return this.incidentService.updatePriority(id, dto, req.user.id);
  }

  // ── Add note ─────────────────────────────────────────────────────────────

  @Post(':id/notes')
  @Roles('SECURITY', 'ADMIN')
  addNote(@Param('id') id: string, @Body() dto: AddNoteDto, @Request() req) {
    return this.incidentService.addNote(id, dto, req.user.id);
  }

  // ── Soft delete (admin only) ─────────────────────────────────────────────

  @Delete(':id')
  @Roles('ADMIN')
  softDelete(@Param('id') id: string, @Request() req) {
    return this.incidentService.softDelete(id, req.user.id);
  }
}
