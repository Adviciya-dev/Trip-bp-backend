import { IsOptional, IsString } from 'class-validator';

export class QuerySubAgenciesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}
