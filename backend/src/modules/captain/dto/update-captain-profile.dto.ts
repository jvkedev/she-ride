import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
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
}
