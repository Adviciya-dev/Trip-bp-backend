import { ServiceType } from '@prisma/client';
export declare class CreateTripDto {
    serviceType: ServiceType;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    pickupAddress: string;
    pickupLat?: number;
    pickupLng?: number;
    dropAddress: string;
    dropLat?: number;
    dropLng?: number;
    scheduledAt: string;
    scheduledEndAt?: string;
    paxCount?: number;
    luggageCount?: number;
    notes?: string;
    distanceKm?: number;
    estimatedFare?: number;
    finalFare?: number;
    overrideReason?: string;
}
