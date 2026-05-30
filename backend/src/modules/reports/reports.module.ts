import { Module } from '@nestjs/common';
import { CaptainReportsController } from './captain-reports.controller';
import { CaptainReportsService } from './captain-reports.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [CaptainReportsController],
  providers: [CaptainReportsService],
  exports: [CaptainReportsService],
})
export class ReportsModule {}
