import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { VehicleType, PaymentMethod } from '@prisma/client';

export class CreateRideDto {
  @IsString()
  pickupAddress!: string;

  @IsString()
  dropAddress!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLatitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLongitude!: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  dropLatitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  dropLongitude!: number;

  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
