import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class UpsertServiceTypeDto {
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
