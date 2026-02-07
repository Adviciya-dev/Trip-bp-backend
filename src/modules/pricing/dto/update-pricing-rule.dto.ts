import {
  IsNumber,
  IsDateString,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdatePricingRuleDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  ratePerKm?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minFare?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  includedKm?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  extraKmRate?: number;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
