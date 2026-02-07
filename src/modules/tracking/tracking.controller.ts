import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

@Controller('tracking')
export class TrackingController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get(':token')
  async getByToken(@Param('token') token: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { trackingToken: token },
      include: {
        org: { select: { name: true, logo: true } },
        assignment: {
          include: {
            driver: { select: { name: true, phone: true } },
          },
        },
        statusLogs: {
          select: {
            toStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Tracking link not found or has expired');
    }

    // Check expiry: 48 hours after completion
    const terminalStatuses: TripStatus[] = [
      TripStatus.COMPLETED,
      TripStatus.CANCELLED,
      TripStatus.NO_SHOW,
    ];

    if (terminalStatuses.includes(trip.status)) {
      const lastLog = trip.statusLogs[trip.statusLogs.length - 1];
      if (lastLog) {
        const completedAt = new Date(lastLog.createdAt);
        const expiresAt = new Date(completedAt.getTime() + 48 * 60 * 60 * 1000);
        if (new Date() > expiresAt) {
          return {
            expired: true,
            status: trip.status,
            message:
              'This tracking link has expired. The trip has been completed.',
          };
        }
      }
    }

    // Only show driver info after assignment
    const isAssigned =
      trip.status !== TripStatus.DRAFT &&
      trip.status !== TripStatus.CONFIRMED &&
      trip.status !== TripStatus.READY_FOR_ASSIGNMENT;

    return {
      expired: false,
      orgName: trip.org.name,
      orgLogo: trip.org.logo,
      tripNumber: trip.tripNumber,
      status: trip.status,
      serviceType: trip.serviceType,
      scheduledAt: trip.scheduledAt,
      scheduledEndAt: trip.scheduledEndAt,
      pickupAddress: trip.pickupAddress,
      dropAddress: trip.dropAddress,
      paxCount: trip.paxCount,
      driver:
        isAssigned && trip.assignment?.driver
          ? {
              name: trip.assignment.driver.name,
              phone: trip.assignment.driver.phone,
            }
          : null,
      timeline: trip.statusLogs.map((log) => ({
        status: log.toStatus,
        at: log.createdAt,
      })),
    };
  }
}
