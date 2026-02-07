import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreateTripDto {
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  // Customer
  @IsString()
  @MaxLength(200)
  customerName!: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  // Route
  @IsString()
  @MaxLength(500)
  pickupAddress!: string;

  @IsOptional()
  @IsNumber()
  pickupLat?: number;

  @IsOptional()
  @IsNumber()
  pickupLng?: number;

  @IsString()
  @MaxLength(500)
  dropAddress!: string;

  @IsOptional()
  @IsNumber()
  dropLat?: number;

  @IsOptional()
  @IsNumber()
  dropLng?: number;

  // Schedule
  @IsDateString()
  scheduledAt!: string;

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

  // Pricing (optional on creation)
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
