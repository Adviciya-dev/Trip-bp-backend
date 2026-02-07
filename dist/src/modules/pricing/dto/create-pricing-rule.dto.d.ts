import { ServiceType } from '@prisma/client';
export declare class CreatePricingRuleDto {
    serviceType: ServiceType;
    ratePerKm: number;
    minFare: number;
    includedKm?: number;
    extraKmRate?: number;
    effectiveFrom: string;
    isActive?: boolean;
}
