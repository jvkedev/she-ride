import { CaptainReportCategory } from '@prisma/client';

export class CreateCaptainReportDto {
  rideId: string;
  category: CaptainReportCategory;
  description?: string;
  imageUrl?: string;
}
