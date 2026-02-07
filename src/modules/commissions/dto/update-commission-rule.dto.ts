import { IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateCommissionRuleDto {
  @IsOptional()
  @IsEnum(['PERCENTAGE', 'FIXED'])
  commissionType?: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsEnum(['FINAL_FARE', 'NET_FARE'])
  commissionBase?: 'FINAL_FARE' | 'NET_FARE';

  @IsOptional()
  @IsEnum(['AIRPORT_TRANSFER', 'ONE_DAY', 'MULTI_DAY'])
  serviceType?: 'AIRPORT_TRANSFER' | 'ONE_DAY' | 'MULTI_DAY' | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
