import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(orgId: string) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const startOfYesterday = new Date(
      startOfToday.getTime() - 24 * 60 * 60 * 1000,
    );

    const baseWhere = { orgId, deletedAt: null };

    const [
      todayTrips,
      yesterdayTrips,
      inProgress,
      yesterdayInProgress,
      completedToday,
      completedYesterday,
      pendingAssignment,
      yesterdayPendingAssignment,
    ] = await Promise.all([
      // Today's trips
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          scheduledAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      // Yesterday's trips (for trend)
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          scheduledAt: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      // In progress (ENROUTE + PICKED_UP)
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          status: { in: [TripStatus.ENROUTE, TripStatus.PICKED_UP] },
        },
      }),
      // Yesterday in progress snapshot (approximate using completed yesterday)
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          status: { in: [TripStatus.ENROUTE, TripStatus.PICKED_UP] },
          scheduledAt: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      // Completed today
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          status: TripStatus.COMPLETED,
          updatedAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      // Completed yesterday
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          status: TripStatus.COMPLETED,
          updatedAt: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      // Pending assignment
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          status: {
            in: [
              TripStatus.DRAFT,
              TripStatus.CONFIRMED,
              TripStatus.READY_FOR_ASSIGNMENT,
            ],
          },
        },
      }),
      // Yesterday pending assignment
      this.prisma.trip.count({
        where: {
          ...baseWhere,
          status: {
            in: [
              TripStatus.DRAFT,
              TripStatus.CONFIRMED,
              TripStatus.READY_FOR_ASSIGNMENT,
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

  async getActivity(orgId: string) {
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

  async getRevenue(orgId: string) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    const sevenDaysAgo = new Date(
      startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const baseWhere = {
      orgId,
      deletedAt: null,
      status: TripStatus.COMPLETED,
    };

    // Today's completed trips with pricing
    const todayTrips = await this.prisma.trip.findMany({
      where: {
        ...baseWhere,
        updatedAt: { gte: startOfToday, lt: endOfToday },
      },
      include: {
        pricing: { select: { finalFare: true, estimatedFare: true } },
      },
    });

    const todayRevenue = todayTrips.reduce(
      (sum, t) => sum + (t.pricing?.finalFare ?? t.pricing?.estimatedFare ?? 0),
      0,
    );

    // This week's completed trips
    const weekTrips = await this.prisma.trip.findMany({
      where: {
        ...baseWhere,
        updatedAt: { gte: startOfWeek },
      },
      include: {
        pricing: { select: { finalFare: true, estimatedFare: true } },
      },
    });

    const weekRevenue = weekTrips.reduce(
      (sum, t) => sum + (t.pricing?.finalFare ?? t.pricing?.estimatedFare ?? 0),
      0,
    );

    // Last 7 days daily revenue
    const last7DaysTrips = await this.prisma.trip.findMany({
      where: {
        ...baseWhere,
        updatedAt: { gte: sevenDaysAgo },
      },
      include: {
        pricing: { select: { finalFare: true, estimatedFare: true } },
      },
    });

    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      dailyMap.set(d.toISOString().split('T')[0], 0);
    }

    for (const trip of last7DaysTrips) {
      const dateKey = trip.updatedAt.toISOString().split('T')[0];
      if (dailyMap.has(dateKey)) {
        dailyMap.set(
          dateKey,
          (dailyMap.get(dateKey) || 0) +
            (trip.pricing?.finalFare ?? trip.pricing?.estimatedFare ?? 0),
        );
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

  async getTodayTrips(orgId: string) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
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
}
