import { ServiceType, TripStatus } from '@prisma/client';
export declare class UpdateTripDto {
    serviceType?: ServiceType;
    status?: TripStatus;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    pickupAddress?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropAddress?: string;
    dropLat?: number;
    dropLng?: number;
    scheduledAt?: string;
    scheduledEndAt?: string;
    paxCount?: number;
    luggageCount?: number;
    notes?: string;
    distanceKm?: number;
    estimatedFare?: number;
    finalFare?: number;
    overrideReason?: string;
}
