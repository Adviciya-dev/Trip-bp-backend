import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssignmentType } from '@prisma/client';

export class AssignTripDto {
  @IsEnum(AssignmentType)
  assignmentType!: AssignmentType;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  subAgencyId?: string;
}
