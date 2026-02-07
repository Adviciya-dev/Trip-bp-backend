import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsEnum,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class UpdateSubAgencyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ServiceType, { each: true })
  servicesAllowed?: ServiceType[];

  @IsOptional()
  @IsString()
  settlementCycle?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
