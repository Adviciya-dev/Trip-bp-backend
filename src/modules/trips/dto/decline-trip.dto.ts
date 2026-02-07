import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeclineTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
