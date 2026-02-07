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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(orgId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
        const baseWhere = { orgId, deletedAt: null };
        const [todayTrips, yesterdayTrips, inProgress, yesterdayInProgress, completedToday, completedYesterday, pendingAssignment, yesterdayPendingAssignment,] = await Promise.all([
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    scheduledAt: { gte: startOfToday, lt: endOfToday },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    scheduledAt: { gte: startOfYesterday, lt: startOfToday },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: { in: [client_1.TripStatus.ENROUTE, client_1.TripStatus.PICKED_UP] },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: { in: [client_1.TripStatus.ENROUTE, client_1.TripStatus.PICKED_UP] },
                    scheduledAt: { gte: startOfYesterday, lt: startOfToday },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: client_1.TripStatus.COMPLETED,
                    updatedAt: { gte: startOfToday, lt: endOfToday },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: client_1.TripStatus.COMPLETED,
                    updatedAt: { gte: startOfYesterday, lt: startOfToday },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: {
                        in: [
                            client_1.TripStatus.DRAFT,
                            client_1.TripStatus.CONFIRMED,
                            client_1.TripStatus.READY_FOR_ASSIGNMENT,
                        ],
                    },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: {
                        in: [
                            client_1.TripStatus.DRAFT,
                            client_1.TripStatus.CONFIRMED,
                            client_1.TripStatus.READY_FOR_ASSIGNMENT,
                        ],
                    },
                    scheduledAt: { gte: startOfYesterday, lt: startOfToday },
                },
            }),
        ]);
        return {
            todayTrips: { value: todayTrips, yesterday: yesterdayTrips },
            inProgress: { value: inProgress, yesterday: yesterdayInProgress },
            completedToday: { value: completedToday, yesterday: completedYesterday },
            pendingAssignment: {
                value: pendingAssignment,
                yesterday: yesterdayPendingAssignment,
            },
        };
    }
    async getActivity(orgId) {
        const logs = await this.prisma.tripStatusLog.findMany({
            where: { trip: { orgId, deletedAt: null } },
            include: {
                actor: { select: { name: true, role: true } },
                trip: { select: { tripNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        return logs.map((log) => ({
            id: log.id,
            tripNumber: log.trip.tripNumber,
            tripId: log.tripId,
            actorName: log.actor.name,
            actorRole: log.actor.role,
            fromStatus: log.fromStatus,
            toStatus: log.toStatus,
            notes: log.notes,
            createdAt: log.createdAt,
        }));
    }
    async getRevenue(orgId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        const baseWhere = {
            orgId,
            deletedAt: null,
            status: client_1.TripStatus.COMPLETED,
        };
        const todayTrips = await this.prisma.trip.findMany({
            where: {
                ...baseWhere,
                updatedAt: { gte: startOfToday, lt: endOfToday },
            },
            include: {
                pricing: { select: { finalFare: true, estimatedFare: true } },
            },
        });
        const todayRevenue = todayTrips.reduce((sum, t) => sum + (t.pricing?.finalFare ?? t.pricing?.estimatedFare ?? 0), 0);
        const weekTrips = await this.prisma.trip.findMany({
            where: {
                ...baseWhere,
                updatedAt: { gte: startOfWeek },
            },
            include: {
                pricing: { select: { finalFare: true, estimatedFare: true } },
            },
        });
        const weekRevenue = weekTrips.reduce((sum, t) => sum + (t.pricing?.finalFare ?? t.pricing?.estimatedFare ?? 0), 0);
        const last7DaysTrips = await this.prisma.trip.findMany({
            where: {
                ...baseWhere,
                updatedAt: { gte: sevenDaysAgo },
            },
            include: {
                pricing: { select: { finalFare: true, estimatedFare: true } },
            },
        });
        const dailyMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
            dailyMap.set(d.toISOString().split('T')[0], 0);
        }
        for (const trip of last7DaysTrips) {
            const dateKey = trip.updatedAt.toISOString().split('T')[0];
            if (dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) +
                    (trip.pricing?.finalFare ?? trip.pricing?.estimatedFare ?? 0));
            }
        }
        return {
            todayRevenue: Math.round(todayRevenue * 100) / 100,
            weekRevenue: Math.round(weekRevenue * 100) / 100,
            daily: Array.from(dailyMap.entries()).map(([date, revenue]) => ({
                date,
                revenue: Math.round(revenue * 100) / 100,
            })),
        };
    }
    async getTodayTrips(orgId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        return this.prisma.trip.findMany({
            where: {
                orgId,
                deletedAt: null,
                scheduledAt: { gte: startOfToday, lt: endOfToday },
            },
            select: {
                id: true,
                tripNumber: true,
                status: true,
                serviceType: true,
                customerName: true,
                pickupAddress: true,
                dropAddress: true,
                scheduledAt: true,
                assignment: {
                    select: {
                        driver: { select: { name: true } },
                        subAgency: { select: { name: true } },
                    },
                },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 20,
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map