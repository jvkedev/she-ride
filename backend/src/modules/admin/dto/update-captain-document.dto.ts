import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentStatus } from '@prisma/client';

export class UpdateCaptainDocumentDto {
  @IsEnum(DocumentStatus)
  status!: DocumentStatus;

  @IsIn([
    'driving_license',
    'vehicle_rc',
    'vehicle_insurance',
    'government_id',
  ])
  documentKey!:
    | 'driving_license'
    | 'vehicle_rc'
    | 'vehicle_insurance'
    | 'government_id';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
