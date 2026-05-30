import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateCaptainProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsBoolean()
  safetyAlertEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyRequestAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  shareLiveLocation?: boolean;
}
