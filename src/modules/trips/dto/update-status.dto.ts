import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TripStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(TripStatus)
  status!: TripStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
