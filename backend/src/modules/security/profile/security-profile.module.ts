import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../../../common/cloudinary/cloudinary.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { SecurityProfileController } from './security-profile.controller';
import { SecurityProfileService } from './security-profile.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [SecurityProfileController],
  providers: [SecurityProfileService],
  exports: [SecurityProfileService],
})
export class SecurityProfileModule {}
