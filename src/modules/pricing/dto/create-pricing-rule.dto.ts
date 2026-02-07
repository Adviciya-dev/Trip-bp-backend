import {
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreatePricingRuleDto {
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @IsNumber()
  @Min(0)
  ratePerKm!: number;

  @IsNumber()
  @Min(0)
  minFare!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  includedKm?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  extraKmRate?: number;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
