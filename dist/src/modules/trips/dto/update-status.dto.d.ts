import { TripStatus } from '@prisma/client';
export declare class UpdateStatusDto {
    status: TripStatus;
    notes?: string;
}
