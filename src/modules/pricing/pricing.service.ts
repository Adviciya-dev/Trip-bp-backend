import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ServiceType } from '@prisma/client';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { CalculateFareDto } from './dto/calculate-fare.dto';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.pricingRule.findMany({
      where: { orgId },
      orderBy: [{ serviceType: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }

  async findOne(id: string, orgId: string) {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { id, orgId },
    });

    if (!rule) {
      throw new NotFoundException('Pricing rule not found');
    }

    return rule;
  }

  async create(dto: CreatePricingRuleDto, orgId: string) {
    return this.prisma.pricingRule.create({
      data: {
        orgId,
        serviceType: dto.serviceType,
        ratePerKm: dto.ratePerKm,
        minFare: dto.minFare,
        includedKm: dto.includedKm ?? 0,
        extraKmRate: dto.extraKmRate ?? 0,
        effectiveFrom: new Date(dto.effectiveFrom),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdatePricingRuleDto, orgId: string) {
    await this.findOne(id, orgId);

    const data: Record<string, unknown> = {};
    if (dto.ratePerKm !== undefined) data.ratePerKm = dto.ratePerKm;
    if (dto.minFare !== undefined) data.minFare = dto.minFare;
    if (dto.includedKm !== undefined) data.includedKm = dto.includedKm;
    if (dto.extraKmRate !== undefined) data.extraKmRate = dto.extraKmRate;
    if (dto.effectiveFrom !== undefined)
      data.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.pricingRule.update({
      where: { id },
      data: data as never,
    });
  }

  async calculateFare(dto: CalculateFareDto, orgId: string) {
    const rule = await this.findActiveRule(orgId, dto.serviceType);

    if (!rule) {
      throw new BadRequestException(
        `No active pricing rule found for service type: ${dto.serviceType}`,
      );
    }

    const fare = this.computeFare(rule, dto.distanceKm);

    return {
      estimatedFare: Math.round(fare * 100) / 100,
      distanceKm: dto.distanceKm,
      ruleId: rule.id,
      breakdown: {
        serviceType: dto.serviceType,
        ratePerKm: rule.ratePerKm,
        minFare: rule.minFare,
        includedKm: rule.includedKm,
        extraKmRate: rule.extraKmRate,
        effectiveFrom: rule.effectiveFrom,
      },
    };
  }

  // Shared calculation logic, also used by TripsService
  async findActiveRule(orgId: string, serviceType: ServiceType) {
    return this.prisma.pricingRule.findFirst({
      where: {
        orgId,
        serviceType,
        isActive: true,
        effectiveFrom: { lte: new Date() },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  computeFare(
    rule: {
      minFare: number;
      includedKm: number;
      ratePerKm: number;
      extraKmRate: number;
    },
    distanceKm: number,
  ): number {
    if (distanceKm <= rule.includedKm) {
      return rule.minFare;
    }

    const extraKm = distanceKm - rule.includedKm;
    const computed =
      rule.includedKm * rule.ratePerKm + extraKm * rule.extraKmRate;
    return Math.max(rule.minFare, computed);
  }
}
