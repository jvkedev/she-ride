import { Module } from '@nestjs/common';
import { CaptainController } from './captain.controller';
import { CaptainService } from './captain.service';
import { CaptainVerificationService } from './captain-verification.service';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [CaptainController],
  providers: [CaptainService, CaptainVerificationService],
  exports: [CaptainVerificationService],
})
export class CaptainModule {}
