import { IsString, IsOptional, IsInt, Min, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MinLength(2)
  plateNumber!: string;

  @IsString()
  vehicleType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsString()
  driverId?: string;
}
