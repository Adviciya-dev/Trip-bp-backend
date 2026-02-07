import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  MinLength,
} from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  plateNumber?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsString()
  driverId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
