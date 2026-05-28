import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IncidentStatus, IncidentPriority } from '@prisma/client';

// Valid transitions — enforced in service, defined here for reference
// OPEN        → TRIAGED, REJECTED, DUPLICATE
// TRIAGED     → INVESTIGATING
// INVESTIGATING → PENDING_INFO, ESCALATED, RESOLVED
// PENDING_INFO → INVESTIGATING
// ESCALATED   → INVESTIGATING, RESOLVED
// RESOLVED    → CLOSED, REOPENED
// REOPENED    → INVESTIGATING

export class UpdateIncidentStatusDto {
  @IsEnum(IncidentStatus, {
    message: `status must be one of: ${Object.values(IncidentStatus).join(', ')}`,
  })
  status!: IncidentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string; // required when status is REJECTED, RESOLVED, CLOSED
}

export class UpdateIncidentPriorityDto {
  @IsEnum(IncidentPriority, {
    message: `priority must be one of: P1, P2, P3, P4`,
  })
  priority!: IncidentPriority;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AssignIncidentDto {
  @IsString()
  assigneeId!: string; // security agent to assign to — not just self-assign
}
