import { Module } from '@nestjs/common';
import { AccountSecurityService } from './account.service';
import { AccountSecurityController } from './account.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountSecurityController],
  providers: [AccountSecurityService],
  exports: [AccountSecurityService],
})
export class AccountSecurityModule {}
