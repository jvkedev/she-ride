import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { RedisModule } from '../redis/redis.module';
import { PlatformModule } from '../platform/platform.module';
import { CaptainModule } from '../captain/captain.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, RedisModule, PlatformModule, CaptainModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
