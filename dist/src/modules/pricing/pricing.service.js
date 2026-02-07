"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PricingService = class PricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId) {
        return this.prisma.pricingRule.findMany({
            where: { orgId },
            orderBy: [{ serviceType: 'asc' }, { effectiveFrom: 'desc' }],
        });
    }
    async findOne(id, orgId) {
        const rule = await this.prisma.pricingRule.findFirst({
            where: { id, orgId },
        });
        if (!rule) {
            throw new common_1.NotFoundException('Pricing rule not found');
        }
        return rule;
    }
    async create(dto, orgId) {
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
    async update(id, dto, orgId) {
        await this.findOne(id, orgId);
        const data = {};
        if (dto.ratePerKm !== undefined)
            data.ratePerKm = dto.ratePerKm;
        if (dto.minFare !== undefined)
            data.minFare = dto.minFare;
        if (dto.includedKm !== undefined)
            data.includedKm = dto.includedKm;
        if (dto.extraKmRate !== undefined)
            data.extraKmRate = dto.extraKmRate;
        if (dto.effectiveFrom !== undefined)
            data.effectiveFrom = new Date(dto.effectiveFrom);
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        return this.prisma.pricingRule.update({
            where: { id },
            data: data,
        });
    }
    async calculateFare(dto, orgId) {
        const rule = await this.findActiveRule(orgId, dto.serviceType);
        if (!rule) {
            throw new common_1.BadRequestException(`No active pricing rule found for service type: ${dto.serviceType}`);
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
    async findActiveRule(orgId, serviceType) {
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
    computeFare(rule, distanceKm) {
        if (distanceKm <= rule.includedKm) {
            return rule.minFare;
        }
        const extraKm = distanceKm - rule.includedKm;
        const computed = rule.includedKm * rule.ratePerKm + extraKm * rule.extraKmRate;
        return Math.max(rule.minFare, computed);
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PricingService);
//# sourceMappingURL=pricing.service.js.map