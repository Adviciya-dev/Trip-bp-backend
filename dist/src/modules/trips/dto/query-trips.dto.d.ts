import { TripStatus, ServiceType } from '@prisma/client';
export declare class QueryTripsDto {
    status?: TripStatus;
    serviceType?: ServiceType;
    from?: string;
    to?: string;
    search?: string;
    page?: string;
    limit?: string;
}
