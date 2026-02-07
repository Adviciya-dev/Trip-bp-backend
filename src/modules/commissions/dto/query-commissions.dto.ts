import { IsOptional, IsString } from 'class-validator';

export class QueryCommissionsDto {
  @IsOptional()
  @IsString()
  subAgencyId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
