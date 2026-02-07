import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ServiceType } from '@prisma/client';

export class CreateSubAgencyDto {
  @IsString()
  @MinLength(2)
  name!: string;

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
}
