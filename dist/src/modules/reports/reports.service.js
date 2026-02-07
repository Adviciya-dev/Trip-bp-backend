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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTripReport(orgId, query) {
        const where = this.buildTripWhere(orgId, query);
        const trips = await this.prisma.trip.findMany({
            where: where,
            include: {
                pricing: { select: { estimatedFare: true, finalFare: true } },
                assignment: {
                    include: {
                        driver: { select: { name: true } },
                        subAgency: { select: { name: true } },
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
            take: 500,
        });
        const total = trips.length;
        const completed = trips.filter((t) => t.status === client_1.TripStatus.COMPLETED).length;
        const cancelled = trips.filter((t) => t.status === client_1.TripStatus.CANCELLED || t.status === client_1.TripStatus.NO_SHOW).length;
        const fares = trips
            .map((t) => t.pricing?.finalFare ?? t.pricing?.estimatedFare ?? 0)
            .filter((f) => f > 0);
        const avgFare = fares.length > 0 ? fares.reduce((a, b) => a + b, 0) / fares.length : 0;
        return {
            items: trips.map((t) => ({
                id: t.id,
                tripNumber: t.tripNumber,
                scheduledAt: t.scheduledAt,
                customerName: t.customerName,
                serviceType: t.serviceType,
                pickupAddress: t.pickupAddress,
                dropAddress: t.dropAddress,
                status: t.status,
                assignedTo: t.assignment?.driver?.name || t.assignment?.subAgency?.name || null,
                assignmentType: t.assignment?.assignmentType || null,
                fare: t.pricing?.finalFare ?? t.pricing?.estimatedFare ?? null,
            })),
            summary: {
                total,
                completed,
                cancelled,
                avgFare: Math.round(avgFare * 100) / 100,
            },
        };
    }
    async getRevenueReport(orgId, query) {
        const where = this.buildTripWhere(orgId, {
            ...query,
            status: client_1.TripStatus.COMPLETED,
        });
        const trips = await this.prisma.trip.findMany({
            where: where,
            include: {
                pricing: { select: { finalFare: true, estimatedFare: true } },
                assignment: {
                    select: { assignmentType: true },
                },
                expenses: {
                    where: { status: 'APPROVED' },
                    select: { amount: true },
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });
        let totalRevenue = 0;
        let internalRevenue = 0;
        let subAgencyRevenue = 0;
        let totalExpenses = 0;
        const dailyMap = new Map();
        for (const trip of trips) {
            const fare = trip.pricing?.finalFare ?? trip.pricing?.estimatedFare ?? 0;
            const expenseTotal = trip.expenses.reduce((s, e) => s + e.amount, 0);
            totalRevenue += fare;
            totalExpenses += expenseTotal;
            if (trip.assignment?.assignmentType === 'SUB_AGENCY') {
                subAgencyRevenue += fare;
            }
            else {
                internalRevenue += fare;
            }
            const dateKey = trip.scheduledAt.toISOString().split('T')[0];
            const existing = dailyMap.get(dateKey) || {
                date: dateKey,
                revenue: 0,
                trips: 0,
                expenses: 0,
            };
            existing.revenue += fare;
            existing.trips += 1;
            existing.expenses += expenseTotal;
            dailyMap.set(dateKey, existing);
        }
        return {
            summary: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                internalRevenue: Math.round(internalRevenue * 100) / 100,
                subAgencyRevenue: Math.round(subAgencyRevenue * 100) / 100,
                totalExpenses: Math.round(totalExpenses * 100) / 100,
                netRevenue: Math.round((totalRevenue - totalExpenses) * 100) / 100,
                tripCount: trips.length,
            },
            daily: Array.from(dailyMap.values()),
        };
    }
    async getCommissionReport(orgId, query) {
        const where = {
            trip: { orgId, deletedAt: null },
        };
        if (query.subAgencyId) {
            where.subAgencyId = query.subAgencyId;
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.from || query.to) {
            const createdAt = {};
            if (query.from)
                createdAt.gte = new Date(query.from);
            if (query.to)
                createdAt.lte = new Date(query.to);
            where.createdAt = createdAt;
        }
        const commissions = await this.prisma.commissionLedger.findMany({
            where: where,
            include: {
                subAgency: { select: { name: true } },
                trip: {
                    select: { tripNumber: true, scheduledAt: true, serviceType: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const agencyMap = new Map();
        for (const c of commissions) {
            const existing = agencyMap.get(c.subAgencyId) || {
                subAgencyId: c.subAgencyId,
                subAgencyName: c.subAgency.name,
                tripCount: 0,
                totalFare: 0,
                totalCommission: 0,
                pendingAmount: 0,
                approvedAmount: 0,
            };
            existing.tripCount += 1;
            existing.totalFare += c.fareAmount;
            existing.totalCommission += c.commission;
            if (c.status === 'APPROVED') {
                existing.approvedAmount += c.commission;
            }
            else {
                existing.pendingAmount += c.commission;
            }
            agencyMap.set(c.subAgencyId, existing);
        }
        const totalPending = commissions
            .filter((c) => c.status === 'PENDING')
            .reduce((s, c) => s + c.commission, 0);
        const totalApproved = commissions
            .filter((c) => c.status === 'APPROVED')
            .reduce((s, c) => s + c.commission, 0);
        return {
            items: commissions.map((c) => ({
                id: c.id,
                tripNumber: c.trip.tripNumber,
                scheduledAt: c.trip.scheduledAt,
                subAgencyName: c.subAgency.name,
                fareAmount: c.fareAmount,
                commission: c.commission,
                status: c.status,
                createdAt: c.createdAt,
            })),
            byAgency: Array.from(agencyMap.values()),
            summary: {
                totalPending: Math.round(totalPending * 100) / 100,
                totalApproved: Math.round(totalApproved * 100) / 100,
                totalCommissions: commissions.length,
            },
        };
    }
    async exportCsv(orgId, type, query) {
        const dateRange = this.getDateRangeLabel(query);
        if (type === 'trips') {
            const report = await this.getTripReport(orgId, query);
            const headers = [
                'Date',
                'Trip ID',
                'Customer',
                'Service Type',
                'Pickup',
                'Drop',
                'Status',
                'Assigned To',
                'Fare',
            ];
            const rows = report.items.map((t) => [
                new Date(t.scheduledAt).toLocaleDateString('en-IN'),
                t.tripNumber,
                t.customerName,
                t.serviceType,
                `"${(t.pickupAddress || '').replace(/"/g, '""')}"`,
                `"${(t.dropAddress || '').replace(/"/g, '""')}"`,
                t.status,
                t.assignedTo || '',
                t.fare?.toString() || '',
            ]);
            return {
                filename: `trip-report-${dateRange}.csv`,
                content: this.toCsv(headers, rows),
            };
        }
        if (type === 'revenue') {
            const report = await this.getRevenueReport(orgId, query);
            const headers = ['Date', 'Trips', 'Revenue', 'Expenses'];
            const rows = report.daily.map((d) => [
                d.date,
                d.trips.toString(),
                d.revenue.toString(),
                d.expenses.toString(),
            ]);
            return {
                filename: `revenue-report-${dateRange}.csv`,
                content: this.toCsv(headers, rows),
            };
        }
        if (type === 'commissions') {
            const report = await this.getCommissionReport(orgId, query);
            const headers = [
                'Date',
                'Trip',
                'Sub-Agency',
                'Fare',
                'Commission',
                'Status',
            ];
            const rows = report.items.map((c) => [
                new Date(c.createdAt).toLocaleDateString('en-IN'),
                c.tripNumber,
                c.subAgencyName,
                c.fareAmount.toString(),
                c.commission.toString(),
                c.status,
            ]);
            return {
                filename: `commission-report-${dateRange}.csv`,
                content: this.toCsv(headers, rows),
            };
        }
        return { filename: 'report.csv', content: '' };
    }
    buildTripWhere(orgId, query) {
        const where = {
            orgId,
            deletedAt: null,
        };
        if (query.status)
            where.status = query.status;
        if (query.serviceType)
            where.serviceType = query.serviceType;
        if (query.assignmentType) {
            where.assignment = { assignmentType: query.assignmentType };
        }
        if (query.from || query.to) {
            const scheduledAt = {};
            if (query.from)
                scheduledAt.gte = new Date(query.from);
            if (query.to)
                scheduledAt.lte = new Date(query.to);
            where.scheduledAt = scheduledAt;
        }
        return where;
    }
    getDateRangeLabel(query) {
        if (query.from && query.to) {
            return `${query.from}_to_${query.to}`;
        }
        if (query.from)
            return `from_${query.from}`;
        if (query.to)
            return `to_${query.to}`;
        return 'all';
    }
    toCsv(headers, rows) {
        const lines = [headers.join(',')];
        for (const row of rows) {
            lines.push(row.join(','));
        }
        return lines.join('\n');
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map