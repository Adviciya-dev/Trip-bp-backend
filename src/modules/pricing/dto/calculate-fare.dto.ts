import { IsEnum, IsNumber, Min } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CalculateFareDto {
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @IsNumber()
  @Min(0.1)
  distanceKm!: number;
}
