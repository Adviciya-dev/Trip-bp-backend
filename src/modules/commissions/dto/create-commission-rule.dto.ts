import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCommissionRuleDto {
  @IsString()
  subAgencyId!: string;

  @IsEnum(['PERCENTAGE', 'FIXED'])
  commissionType!: 'PERCENTAGE' | 'FIXED';

  @IsNumber()
  @Min(0)
  value!: number;

  @IsEnum(['FINAL_FARE', 'NET_FARE'])
  commissionBase!: 'FINAL_FARE' | 'NET_FARE';

  @IsOptional()
  @IsEnum(['AIRPORT_TRANSFER', 'ONE_DAY', 'MULTI_DAY'])
  serviceType?: 'AIRPORT_TRANSFER' | 'ONE_DAY' | 'MULTI_DAY';
}
