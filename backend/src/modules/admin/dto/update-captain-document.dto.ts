import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class UpdateCaptainDocumentDto {
  @IsEnum(DocumentStatus)
  status!: DocumentStatus;

  @IsOptional()
  @IsIn(['driving_license', 'rc_registration', 'aadhaar', 'selfie'])
  documentKey?: 'driving_license' | 'rc_registration' | 'aadhaar' | 'selfie';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
