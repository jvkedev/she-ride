// src/modules/rider/payments/payment.controller.ts

import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { IsEnum } from 'class-validator';

class SetDefaultMethodDto {
  @IsEnum(['CASH', 'UPI'])
  method!: 'CASH' | 'UPI';
}

@Controller('rider/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RIDER')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** GET /rider/payments/default-method */
  @Get('default-method')
  getDefaultMethod(@Request() req) {
    return this.paymentService.getDefaultMethod(req.user.id);
  }

  /** PATCH /rider/payments/default-method */
  @Patch('default-method')
  setDefaultMethod(@Body() dto: SetDefaultMethodDto, @Request() req) {
    return this.paymentService.setDefaultMethod(req.user.id, dto.method);
  }

  /** GET /rider/payments/last-receipt */
  @Get('last-receipt')
  getLastReceipt(@Request() req) {
    return this.paymentService.getLastRideReceipt(req.user.id);
  }

  /** GET /rider/payments/history */
  @Get('history')
  getPaymentHistory(@Request() req) {
    return this.paymentService.getPaymentHistory(req.user.id);
  }
}
