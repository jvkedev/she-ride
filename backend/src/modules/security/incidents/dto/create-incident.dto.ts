import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { IncidentType, IncidentSeverity } from '@prisma/client';

export class CreateIncidentDto {
  @IsEnum(IncidentType, {
    message: `incidentType must be one of: ${Object.values(IncidentType).join(', ')}`,
  })
  incidentType!: IncidentType;

  @IsEnum(IncidentSeverity, {
    message: `severity must be one of: ${Object.values(IncidentSeverity).join(', ')}`,
  })
  severity!: IncidentSeverity;

  @IsString()
  @MinLength(10, { message: 'description must be at least 10 characters' })
  @MaxLength(2000, { message: 'description cannot exceed 2000 characters' })
  description!: string;

  @IsOptional()
  @IsString()
  rideId?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
