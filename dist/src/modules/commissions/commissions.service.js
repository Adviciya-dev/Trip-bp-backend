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
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CommissionsService = class CommissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllRules(orgId, subAgencyId) {
        const where = { orgId };
        if (subAgencyId)
            where.subAgencyId = subAgencyId;
        return this.prisma.commissionRule.findMany({
            where: where,
            include: {
                subAgency: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createRule(dto, orgId) {
        const agency = await this.prisma.subAgency.findFirst({
            where: { id: dto.subAgencyId, orgId, deletedAt: null },
        });
        if (!agency) {
            throw new common_1.NotFoundException('Sub-agency not found');
        }
        if (dto.commissionType === 'PERCENTAGE' && dto.value > 100) {
            throw new common_1.BadRequestException('Percentage cannot exceed 100');
        }
        return this.prisma.commissionRule.create({
            data: {
                orgId,
                subAgencyId: dto.subAgencyId,
                commissionType: dto.commissionType,
                value: dto.value,
                commissionBase: dto.commissionBase,
                serviceType: dto.serviceType ?? null,
                isActive: true,
            },
            include: {
                subAgency: { select: { id: true, name: true } },
            },
        });
    }
    async updateRule(ruleId, dto, orgId) {
        const rule = await this.prisma.commissionRule.findFirst({
            where: { id: ruleId, orgId },
        });
        if (!rule) {
            throw new common_1.NotFoundException('Commission rule not found');
        }
        if ((dto.commissionType === 'PERCENTAGE' ||
            rule.commissionType === 'PERCENTAGE') &&
            dto.value !== undefined &&
            dto.value > 100) {
            throw new common_1.BadRequestException('Percentage cannot exceed 100');
        }
        const updateData = {};
        if (dto.commissionType !== undefined)
            updateData.commissionType = dto.commissionType;
        if (dto.value !== undefined)
            updateData.value = dto.value;
        if (dto.commissionBase !== undefined)
            updateData.commissionBase = dto.commissionBase;
        if (dto.serviceType !== undefined)
            updateData.serviceType = dto.serviceType;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        return this.prisma.commissionRule.update({
            where: { id: ruleId },
            data: updateData,
            include: {
                subAgency: { select: { id: true, name: true } },
            },
        });
    }
    async calculateCommission(tripId, orgId) {
        const trip = await this.prisma.trip.findFirst({
            where: { id: tripId, orgId },
            include: {
                assignment: true,
                pricing: true,
                expenses: { where: { status: 'APPROVED' } },
            },
        });
        if (!trip || !trip.assignment?.subAgencyId)
            return;
        const existing = await this.prisma.commissionLedger.findUnique({
            where: { tripId },
        });
        if (existing)
            return;
        const subAgencyId = trip.assignment.subAgencyId;
        const rule = await this.findApplicableRule(orgId, subAgencyId, trip.serviceType);
        if (!rule)
            return;
        const finalFare = trip.pricing?.finalFare ?? trip.pricing?.estimatedFare ?? 0;
        if (finalFare <= 0)
            return;
        let fareBase = finalFare;
        if (rule.commissionBase === 'NET_FARE') {
            const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
            fareBase = Math.max(0, finalFare - totalExpenses);
        }
        let commissionAmount;
        if (rule.commissionType === 'PERCENTAGE') {
            commissionAmount = Math.round(fareBase * (rule.value / 100) * 100) / 100;
        }
        else {
            commissionAmount = rule.value;
        }
        await this.prisma.commissionLedger.create({
            data: {
                tripId,
                subAgencyId,
                fareAmount: finalFare,
                commission: commissionAmount,
                status: client_1.CommissionStatus.PENDING,
            },
        });
    }
    async findApplicableRule(orgId, subAgencyId, serviceType) {
        const specificRule = await this.prisma.commissionRule.findFirst({
            where: {
                orgId,
                subAgencyId,
                serviceType: serviceType,
                isActive: true,
            },
        });
        if (specificRule)
            return specificRule;
        return this.prisma.commissionRule.findFirst({
            where: {
                orgId,
                subAgencyId,
                serviceType: null,
                isActive: true,
            },
        });
    }
    async findAllLedger(query, orgId) {
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const skip = (page - 1) * limit;
        const where = {
            trip: { orgId, deletedAt: null },
        };
        if (query.subAgencyId)
            where.subAgencyId = query.subAgencyId;
        if (query.status)
            where.status = query.status;
        if (query.from || query.to) {
            const createdAt = {};
            if (query.from)
                createdAt.gte = new Date(query.from);
            if (query.to)
                createdAt.lte = new Date(query.to);
            where.createdAt = createdAt;
        }
        const [items, total] = await Promise.all([
            this.prisma.commissionLedger.findMany({
                where: where,
                include: {
                    trip: {
                        select: {
                            tripNumber: true,
                            customerName: true,
                            serviceType: true,
                            scheduledAt: true,
                            status: true,
                        },
                    },
                    subAgency: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.commissionLedger.count({ where: where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getLedgerStats(orgId, subAgencyId) {
        const baseWhere = {
            trip: { orgId, deletedAt: null },
        };
        if (subAgencyId)
            baseWhere.subAgencyId = subAgencyId;
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const [totalPending, totalApproved, monthCommission] = await Promise.all([
            this.prisma.commissionLedger.aggregate({
                where: { ...baseWhere, status: client_1.CommissionStatus.PENDING },
                _sum: { commission: true },
                _count: true,
            }),
            this.prisma.commissionLedger.aggregate({
                where: { ...baseWhere, status: client_1.CommissionStatus.APPROVED },
                _sum: { commission: true },
                _count: true,
            }),
            this.prisma.commissionLedger.aggregate({
                where: {
                    ...baseWhere,
                    status: client_1.CommissionStatus.APPROVED,
                    approvedAt: { gte: startOfMonth },
                },
                _sum: { commission: true },
            }),
        ]);
        return {
            pendingAmount: totalPending._sum.commission || 0,
            pendingCount: totalPending._count,
            approvedAmount: totalApproved._sum.commission || 0,
            approvedCount: totalApproved._count,
            monthAmount: monthCommission._sum.commission || 0,
        };
    }
    async approveCommission(ledgerId, orgId) {
        const entry = await this.prisma.commissionLedger.findFirst({
            where: { id: ledgerId, trip: { orgId } },
        });
        if (!entry)
            throw new common_1.NotFoundException('Commission entry not found');
        if (entry.status !== client_1.CommissionStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending commissions can be approved');
        }
        return this.prisma.commissionLedger.update({
            where: { id: ledgerId },
            data: { status: client_1.CommissionStatus.APPROVED, approvedAt: new Date() },
        });
    }
    async rejectCommission(ledgerId, orgId) {
        const entry = await this.prisma.commissionLedger.findFirst({
            where: { id: ledgerId, trip: { orgId } },
        });
        if (!entry)
            throw new common_1.NotFoundException('Commission entry not found');
        if (entry.status !== client_1.CommissionStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending commissions can be rejected');
        }
        return this.prisma.commissionLedger.update({
            where: { id: ledgerId },
            data: { status: client_1.CommissionStatus.REJECTED },
        });
    }
    async bulkApprove(ledgerIds, orgId) {
        const entries = await this.prisma.commissionLedger.findMany({
            where: {
                id: { in: ledgerIds },
                status: client_1.CommissionStatus.PENDING,
                trip: { orgId },
            },
        });
        if (entries.length === 0) {
            throw new common_1.BadRequestException('No pending commissions found');
        }
        await this.prisma.commissionLedger.updateMany({
            where: { id: { in: entries.map((e) => e.id) } },
            data: { status: client_1.CommissionStatus.APPROVED, approvedAt: new Date() },
        });
        return { approved: entries.length };
    }
    async resolveSubAgencyId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { subAgencyId: true },
        });
        if (!user?.subAgencyId) {
            throw new common_1.BadRequestException('User is not linked to a sub-agency');
        }
        return user.subAgencyId;
    }
    async findLedgerForSubAgency(query, orgId, subAgencyId) {
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const skip = (page - 1) * limit;
        const where = {
            subAgencyId,
            trip: { orgId, deletedAt: null },
        };
        if (query.status)
            where.status = query.status;
        if (query.from || query.to) {
            const createdAt = {};
            if (query.from)
                createdAt.gte = new Date(query.from);
            if (query.to)
                createdAt.lte = new Date(query.to);
            where.createdAt = createdAt;
        }
        const [items, total] = await Promise.all([
            this.prisma.commissionLedger.findMany({
                where: where,
                include: {
                    trip: {
                        select: {
                            tripNumber: true,
                            customerName: true,
                            serviceType: true,
                            scheduledAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.commissionLedger.count({ where: where }),
        ]);
        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map