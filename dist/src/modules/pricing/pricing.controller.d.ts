import { PricingService } from './pricing.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { CalculateFareDto } from './dto/calculate-fare.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class PricingController {
    private pricingService;
    constructor(pricingService: PricingService);
    findAll(user: JwtPayload): Promise<{
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
    findOne(id: string, user: JwtPayload): Promise<{
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
    create(dto: CreatePricingRuleDto, user: JwtPayload): Promise<{
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
    update(id: string, dto: UpdatePricingRuleDto, user: JwtPayload): Promise<{
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
    calculateFare(dto: CalculateFareDto, user: JwtPayload): Promise<{
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
}
