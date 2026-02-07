import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommissionStatus } from '@prisma/client';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { QueryCommissionsDto } from './dto/query-commissions.dto';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  // ─── RULES ────────────────────────────────────────────

  async findAllRules(orgId: string, subAgencyId?: string) {
    const where: Record<string, unknown> = { orgId };
    if (subAgencyId) where.subAgencyId = subAgencyId;

    return this.prisma.commissionRule.findMany({
      where: where as never,
      include: {
        subAgency: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(dto: CreateCommissionRuleDto, orgId: string) {
    // Validate sub-agency exists
    const agency = await this.prisma.subAgency.findFirst({
      where: { id: dto.subAgencyId, orgId, deletedAt: null },
    });
    if (!agency) {
      throw new NotFoundException('Sub-agency not found');
    }

    // Validate percentage range
    if (dto.commissionType === 'PERCENTAGE' && dto.value > 100) {
      throw new BadRequestException('Percentage cannot exceed 100');
    }

    return this.prisma.commissionRule.create({
      data: {
        orgId,
        subAgencyId: dto.subAgencyId,
        commissionType: dto.commissionType as never,
        value: dto.value,
        commissionBase: dto.commissionBase as never,
        serviceType: (dto.serviceType as never) ?? null,
        isActive: true,
      },
      include: {
        subAgency: { select: { id: true, name: true } },
      },
    });
  }

  async updateRule(
    ruleId: string,
    dto: UpdateCommissionRuleDto,
    orgId: string,
  ) {
    const rule = await this.prisma.commissionRule.findFirst({
      where: { id: ruleId, orgId },
    });
    if (!rule) {
      throw new NotFoundException('Commission rule not found');
    }

    if (
      (dto.commissionType === 'PERCENTAGE' ||
        rule.commissionType === 'PERCENTAGE') &&
      dto.value !== undefined &&
      dto.value > 100
    ) {
      throw new BadRequestException('Percentage cannot exceed 100');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.commissionType !== undefined)
      updateData.commissionType = dto.commissionType;
    if (dto.value !== undefined) updateData.value = dto.value;
    if (dto.commissionBase !== undefined)
      updateData.commissionBase = dto.commissionBase;
    if (dto.serviceType !== undefined) updateData.serviceType = dto.serviceType;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    return this.prisma.commissionRule.update({
      where: { id: ruleId },
      data: updateData as never,
      include: {
        subAgency: { select: { id: true, name: true } },
      },
    });
  }

  // ─── CALCULATION ──────────────────────────────────────

  async calculateCommission(tripId: string, orgId: string): Promise<void> {
    // Load trip with assignment + pricing + expenses
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, orgId },
      include: {
        assignment: true,
        pricing: true,
        expenses: { where: { status: 'APPROVED' } },
      },
    });

    if (!trip || !trip.assignment?.subAgencyId) return;

    // Already has commission? Skip
    const existing = await this.prisma.commissionLedger.findUnique({
      where: { tripId },
    });
    if (existing) return;

    const subAgencyId = trip.assignment.subAgencyId;

    // Find applicable rule (service-type specific first, then generic)
    const rule = await this.findApplicableRule(
      orgId,
      subAgencyId,
      trip.serviceType,
    );
    if (!rule) return; // No rule configured — no commission

    // Determine fare base
    const finalFare =
      trip.pricing?.finalFare ?? trip.pricing?.estimatedFare ?? 0;
    if (finalFare <= 0) return;

    let fareBase = finalFare;
    if (rule.commissionBase === 'NET_FARE') {
      const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
      fareBase = Math.max(0, finalFare - totalExpenses);
    }

    // Calculate
    let commissionAmount: number;
    if (rule.commissionType === 'PERCENTAGE') {
      commissionAmount = Math.round(fareBase * (rule.value / 100) * 100) / 100;
    } else {
      commissionAmount = rule.value;
    }

    // Create ledger entry
    await this.prisma.commissionLedger.create({
      data: {
        tripId,
        subAgencyId,
        fareAmount: finalFare,
        commission: commissionAmount,
        status: CommissionStatus.PENDING,
      },
    });
  }

  private async findApplicableRule(
    orgId: string,
    subAgencyId: string,
    serviceType: string,
  ) {
    // Try service-type-specific rule first
    const specificRule = await this.prisma.commissionRule.findFirst({
      where: {
        orgId,
        subAgencyId,
        serviceType: serviceType as never,
        isActive: true,
      },
    });
    if (specificRule) return specificRule;

    // Fall back to generic rule (no serviceType)
    return this.prisma.commissionRule.findFirst({
      where: {
        orgId,
        subAgencyId,
        serviceType: null,
        isActive: true,
      },
    });
  }

  // ─── LEDGER (Ops) ────────────────────────────────────

  async findAllLedger(query: QueryCommissionsDto, orgId: string) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      trip: { orgId, deletedAt: null },
    };

    if (query.subAgencyId) where.subAgencyId = query.subAgencyId;
    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) createdAt.gte = new Date(query.from);
      if (query.to) createdAt.lte = new Date(query.to);
      where.createdAt = createdAt;
    }

    const [items, total] = await Promise.all([
      this.prisma.commissionLedger.findMany({
        where: where as never,
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
      this.prisma.commissionLedger.count({ where: where as never }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getLedgerStats(orgId: string, subAgencyId?: string) {
    const baseWhere: Record<string, unknown> = {
      trip: { orgId, deletedAt: null },
    };
    if (subAgencyId) baseWhere.subAgencyId = subAgencyId;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalPending, totalApproved, monthCommission] = await Promise.all([
      this.prisma.commissionLedger.aggregate({
        where: { ...baseWhere, status: CommissionStatus.PENDING } as never,
        _sum: { commission: true },
        _count: true,
      }),
      this.prisma.commissionLedger.aggregate({
        where: { ...baseWhere, status: CommissionStatus.APPROVED } as never,
        _sum: { commission: true },
        _count: true,
      }),
      this.prisma.commissionLedger.aggregate({
        where: {
          ...baseWhere,
          status: CommissionStatus.APPROVED,
          approvedAt: { gte: startOfMonth },
        } as never,
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

  async approveCommission(ledgerId: string, orgId: string) {
    const entry = await this.prisma.commissionLedger.findFirst({
      where: { id: ledgerId, trip: { orgId } },
    });
    if (!entry) throw new NotFoundException('Commission entry not found');
    if (entry.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('Only pending commissions can be approved');
    }

    return this.prisma.commissionLedger.update({
      where: { id: ledgerId },
      data: { status: CommissionStatus.APPROVED, approvedAt: new Date() },
    });
  }

  async rejectCommission(ledgerId: string, orgId: string) {
    const entry = await this.prisma.commissionLedger.findFirst({
      where: { id: ledgerId, trip: { orgId } },
    });
    if (!entry) throw new NotFoundException('Commission entry not found');
    if (entry.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('Only pending commissions can be rejected');
    }

    return this.prisma.commissionLedger.update({
      where: { id: ledgerId },
      data: { status: CommissionStatus.REJECTED },
    });
  }

  async bulkApprove(ledgerIds: string[], orgId: string) {
    const entries = await this.prisma.commissionLedger.findMany({
      where: {
        id: { in: ledgerIds },
        status: CommissionStatus.PENDING,
        trip: { orgId },
      },
    });

    if (entries.length === 0) {
      throw new BadRequestException('No pending commissions found');
    }

    await this.prisma.commissionLedger.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { status: CommissionStatus.APPROVED, approvedAt: new Date() },
    });

    return { approved: entries.length };
  }

  async resolveSubAgencyId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subAgencyId: true },
    });
    if (!user?.subAgencyId) {
      throw new BadRequestException('User is not linked to a sub-agency');
    }
    return user.subAgencyId;
  }

  // ─── LEDGER (Sub-Agency) ─────────────────────────────

  async findLedgerForSubAgency(
    query: QueryCommissionsDto,
    orgId: string,
    subAgencyId: string,
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      subAgencyId,
      trip: { orgId, deletedAt: null },
    };

    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      const createdAt: Record<string, Date> = {};
      if (query.from) createdAt.gte = new Date(query.from);
      if (query.to) createdAt.lte = new Date(query.to);
      where.createdAt = createdAt;
    }

    const [items, total] = await Promise.all([
      this.prisma.commissionLedger.findMany({
        where: where as never,
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
      this.prisma.commissionLedger.count({ where: where as never }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
