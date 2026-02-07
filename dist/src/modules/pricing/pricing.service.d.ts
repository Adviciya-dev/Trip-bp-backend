import { PrismaService } from '../../prisma/prisma.service';
import { ServiceType } from '@prisma/client';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { CalculateFareDto } from './dto/calculate-fare.dto';
export declare class PricingService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        ratePerKm: number;
        minFare: number;
        includedKm: number;
        extraKmRate: number;
        effectiveFrom: Date;
    }[]>;
    findOne(id: string, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        ratePerKm: number;
        minFare: number;
        includedKm: number;
        extraKmRate: number;
        effectiveFrom: Date;
    }>;
    create(dto: CreatePricingRuleDto, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        ratePerKm: number;
        minFare: number;
        includedKm: number;
        extraKmRate: number;
        effectiveFrom: Date;
    }>;
    update(id: string, dto: UpdatePricingRuleDto, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        ratePerKm: number;
        minFare: number;
        includedKm: number;
        extraKmRate: number;
        effectiveFrom: Date;
    }>;
    calculateFare(dto: CalculateFareDto, orgId: string): Promise<{
        estimatedFare: number;
        distanceKm: number;
        ruleId: string;
        breakdown: {
            serviceType: import(".prisma/client").$Enums.ServiceType;
            ratePerKm: number;
            minFare: number;
            includedKm: number;
            extraKmRate: number;
            effectiveFrom: Date;
        };
    }>;
    findActiveRule(orgId: string, serviceType: ServiceType): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        ratePerKm: number;
        minFare: number;
        includedKm: number;
        extraKmRate: number;
        effectiveFrom: Date;
    } | null>;
    computeFare(rule: {
        minFare: number;
        includedKm: number;
        ratePerKm: number;
        extraKmRate: number;
    }, distanceKm: number): number;
}
