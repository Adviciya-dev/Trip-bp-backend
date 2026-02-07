import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ServiceType, TripStatus } from '@prisma/client';

export class UpdateTripDto {
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  // Customer
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  // Route
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pickupAddress?: string;

  @IsOptional()
  @IsNumber()
  pickupLat?: number;

  @IsOptional()
  @IsNumber()
  pickupLng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  dropAddress?: string;

  @IsOptional()
  @IsNumber()
  dropLat?: number;

  @IsOptional()
  @IsNumber()
  dropLng?: number;

  // Schedule
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledEndAt?: string;

  // Passengers
  @IsOptional()
  @IsNumber()
  @Min(1)
  paxCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  luggageCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  // Pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedFare?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  finalFare?: number;

  @IsOptional()
  @IsString()
  overrideReason?: string;
}
