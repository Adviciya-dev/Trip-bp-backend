import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus, AssignmentType } from '@prisma/client';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryTripsDto } from './dto/query-trips.dto';
import { AssignTripDto } from './dto/assign-trip.dto';
import { DeclineTripDto } from './dto/decline-trip.dto';
import { CommissionsService } from '../commissions/commissions.service';
import { ChatService } from '../chat/chat.service';

const STATUS_MESSAGES: Record<string, string> = {
  CONFIRMED: 'Trip confirmed',
  READY_FOR_ASSIGNMENT: 'Trip is ready for assignment',
  ENROUTE: 'Driver is en route',
  PICKED_UP: 'Passenger picked up',
  COMPLETED: 'Trip completed',
  CANCELLED: 'Trip cancelled',
  NO_SHOW: 'Marked as no-show',
};

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private commissionsService: CommissionsService,
    private chatService: ChatService,
  ) {}

  async create(dto: CreateTripDto, actor: JwtPayload) {
    const tripNumber = await this.generateTripNumber(actor.orgId);

    // Create trip with optional pricing in a transaction
    const created = await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          orgId: actor.orgId,
          tripNumber,
          serviceType: dto.serviceType,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          pickupAddress: dto.pickupAddress,
          pickupLat: dto.pickupLat,
          pickupLng: dto.pickupLng,
          dropAddress: dto.dropAddress,
          dropLat: dto.dropLat,
          dropLng: dto.dropLng,
          scheduledAt: new Date(dto.scheduledAt),
          scheduledEndAt: dto.scheduledEndAt
            ? new Date(dto.scheduledEndAt)
            : null,
          paxCount: dto.paxCount ?? 1,
          luggageCount: dto.luggageCount ?? 0,
          notes: dto.notes,
          status: TripStatus.DRAFT,
        },
      });

      // Auto-pricing: calculate if distance provided, or use supplied values
      const pricing = await this.calculatePricing(
        tx,
        actor.orgId,
        dto.serviceType,
        dto.distanceKm,
        dto.estimatedFare,
        dto.finalFare,
        dto.overrideReason,
      );

      if (pricing) {
        await tx.tripPricing.create({
          data: {
            tripId: trip.id,
            ...pricing,
          },
        });
      }

      // Create initial status log
      await tx.tripStatusLog.create({
        data: {
          tripId: trip.id,
          fromStatus: null,
          toStatus: TripStatus.DRAFT,
          actorId: actor.userId,
          actorRole: actor.role as never,
          notes: 'Trip created',
        },
      });

      return trip;
    });

    return this.findOne(created.id, actor.orgId);
  }

  async findAll(query: QueryTripsDto, orgId: string) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      orgId,
      deletedAt: null,
    };

    if (query.status) where.status = query.status;
    if (query.serviceType) where.serviceType = query.serviceType;

    if (query.from || query.to) {
      const scheduledAt: Record<string, Date> = {};
      if (query.from) scheduledAt.gte = new Date(query.from);
      if (query.to) scheduledAt.lte = new Date(query.to);
      where.scheduledAt = scheduledAt;
    }

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search } },
        { tripNumber: { contains: query.search, mode: 'insensitive' } },
        { pickupAddress: { contains: query.search, mode: 'insensitive' } },
        { dropAddress: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: where as never,
        include: {
          pricing: true,
          assignment: {
            include: {
              driver: { select: { id: true, name: true, phone: true } },
              subAgency: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where: where as never }),
    ]);

    return {
      items: trips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tripId: string, orgId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, orgId, deletedAt: null },
      include: {
        pricing: true,
        assignment: {
          include: {
            driver: { select: { id: true, name: true, phone: true } },
            subAgency: { select: { id: true, name: true } },
          },
        },
        statusLogs: {
          include: {
            actor: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async update(tripId: string, dto: UpdateTripDto, actor: JwtPayload) {
    const existing = await this.findOne(tripId, actor.orgId);

    // Track status changes
    const statusChanged = dto.status && dto.status !== existing.status;

    await this.prisma.$transaction(async (tx) => {
      // Update trip fields
      const {
        distanceKm,
        estimatedFare,
        finalFare,
        overrideReason,
        ...tripData
      } = dto;

      const updateData: Record<string, unknown> = {};
      if (tripData.serviceType) updateData.serviceType = tripData.serviceType;
      if (tripData.status) updateData.status = tripData.status;
      if (tripData.customerName)
        updateData.customerName = tripData.customerName;
      if (tripData.customerPhone !== undefined)
        updateData.customerPhone = tripData.customerPhone;
      if (tripData.customerEmail !== undefined)
        updateData.customerEmail = tripData.customerEmail;
      if (tripData.pickupAddress)
        updateData.pickupAddress = tripData.pickupAddress;
      if (tripData.pickupLat !== undefined)
        updateData.pickupLat = tripData.pickupLat;
      if (tripData.pickupLng !== undefined)
        updateData.pickupLng = tripData.pickupLng;
      if (tripData.dropAddress) updateData.dropAddress = tripData.dropAddress;
      if (tripData.dropLat !== undefined) updateData.dropLat = tripData.dropLat;
      if (tripData.dropLng !== undefined) updateData.dropLng = tripData.dropLng;
      if (tripData.scheduledAt)
        updateData.scheduledAt = new Date(tripData.scheduledAt);
      if (tripData.scheduledEndAt !== undefined)
        updateData.scheduledEndAt = tripData.scheduledEndAt
          ? new Date(tripData.scheduledEndAt)
          : null;
      if (tripData.paxCount !== undefined)
        updateData.paxCount = tripData.paxCount;
      if (tripData.luggageCount !== undefined)
        updateData.luggageCount = tripData.luggageCount;
      if (tripData.notes !== undefined) updateData.notes = tripData.notes;

      await tx.trip.update({
        where: { id: tripId },
        data: updateData as never,
      });

      // Update pricing if provided
      if (
        distanceKm !== undefined ||
        estimatedFare !== undefined ||
        finalFare !== undefined
      ) {
        const pricingData: Record<string, unknown> = {};
        if (distanceKm !== undefined) pricingData.distanceKm = distanceKm;
        if (estimatedFare !== undefined)
          pricingData.estimatedFare = estimatedFare;
        if (finalFare !== undefined) {
          pricingData.finalFare = finalFare;
          pricingData.isLocked = true;
        }
        if (overrideReason) pricingData.overrideReason = overrideReason;

        await tx.tripPricing.upsert({
          where: { tripId },
          create: { tripId, ...pricingData } as never,
          update: pricingData as never,
        });
      }

      // Log status change
      if (statusChanged && dto.status) {
        await tx.tripStatusLog.create({
          data: {
            tripId,
            fromStatus: existing.status,
            toStatus: dto.status,
            actorId: actor.userId,
            actorRole: actor.role as never,
          },
        });
      }
    });

    return this.findOne(tripId, actor.orgId);
  }

  async softDelete(tripId: string, orgId: string) {
    const trip = await this.findOne(tripId, orgId);

    if (
      trip.status !== TripStatus.DRAFT &&
      trip.status !== TripStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only DRAFT or CANCELLED trips can be deleted',
      );
    }

    await this.prisma.trip.update({
      where: { id: tripId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Trip deleted' };
  }

  async updateStatus(tripId: string, dto: UpdateStatusDto, actor: JwtPayload) {
    const existing = await this.findOne(tripId, actor.orgId);

    // Validate transition
    const allowed = this.getAllowedTransitions(existing.status);
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${existing.status} to ${dto.status}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = { status: dto.status };

      // Generate tracking token on confirmation
      if (dto.status === TripStatus.CONFIRMED && !existing.trackingToken) {
        updateData.trackingToken = randomUUID();
      }

      await tx.trip.update({
        where: { id: tripId },
        data: updateData as never,
      });

      await tx.tripStatusLog.create({
        data: {
          tripId,
          fromStatus: existing.status,
          toStatus: dto.status,
          actorId: actor.userId,
          actorRole: actor.role as never,
          notes: dto.notes,
        },
      });
    });

    const updatedTrip = await this.findOne(tripId, actor.orgId);

    // Auto-generate commission for sub-agency trips on completion
    if (
      dto.status === TripStatus.COMPLETED &&
      existing.assignment?.subAgencyId
    ) {
      // Fire-and-forget — don't block the response
      this.commissionsService
        .calculateCommission(tripId, actor.orgId)
        .catch(() => {});
    }

    // Auto system chat message
    const statusMsg = STATUS_MESSAGES[dto.status];
    if (statusMsg) {
      this.chatService
        .createSystemMessage(tripId, actor.userId, statusMsg)
        .catch(() => {});
    }

    return updatedTrip;
  }

  async getTimeline(tripId: string, orgId: string) {
    // Verify trip exists and belongs to org
    await this.findOne(tripId, orgId);

    return this.prisma.tripStatusLog.findMany({
      where: { tripId },
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getStats(orgId: string) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const baseWhere = { orgId, deletedAt: null };

    const [todayTrips, needsAttention, completedToday, totalActive] =
      await Promise.all([
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            scheduledAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
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
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            status: TripStatus.COMPLETED,
            updatedAt: { gte: startOfDay, lt: endOfDay },
          },
        }),
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            status: {
              notIn: [
                TripStatus.COMPLETED,
                TripStatus.CANCELLED,
                TripStatus.NO_SHOW,
              ],
            },
          },
        }),
      ]);

    return { todayTrips, needsAttention, completedToday, totalActive };
  }

  // --- Sub-Agency Scoped ---

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

  async findAllForSubAgency(
    query: QueryTripsDto,
    orgId: string,
    subAgencyId: string,
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      orgId,
      deletedAt: null,
      assignment: { subAgencyId },
    };

    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      const scheduledAt: Record<string, Date> = {};
      if (query.from) scheduledAt.gte = new Date(query.from);
      if (query.to) scheduledAt.lte = new Date(query.to);
      where.scheduledAt = scheduledAt;
    }

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { tripNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: where as never,
        include: {
          pricing: true,
          assignment: {
            include: {
              driver: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where: where as never }),
    ]);

    return {
      items: trips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStatsForSubAgency(orgId: string, subAgencyId: string) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const baseWhere = {
      orgId,
      deletedAt: null,
      assignment: { subAgencyId },
    };

    const [todayTrips, pendingAcceptance, completedMonth, totalAssigned] =
      await Promise.all([
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            scheduledAt: { gte: startOfDay, lt: endOfDay },
          } as never,
        }),
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            status: TripStatus.ASSIGNED_SUB_AGENCY,
            assignment: { subAgencyId, isAccepted: null },
          } as never,
        }),
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            status: TripStatus.COMPLETED,
            updatedAt: { gte: startOfMonth },
          } as never,
        }),
        this.prisma.trip.count({
          where: baseWhere as never,
        }),
      ]);

    return { todayTrips, pendingAcceptance, completedMonth, totalAssigned };
  }

  // --- Driver Scoped ---

  async resolveDriverId(userId: string): Promise<string> {
    const driver = await this.prisma.driver.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!driver) {
      throw new BadRequestException('User is not linked to a driver profile');
    }
    return driver.id;
  }

  async findAllForDriver(
    query: QueryTripsDto,
    orgId: string,
    driverId: string,
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      orgId,
      deletedAt: null,
      assignment: { driverId },
    };

    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      const scheduledAt: Record<string, Date> = {};
      if (query.from) scheduledAt.gte = new Date(query.from);
      if (query.to) scheduledAt.lte = new Date(query.to);
      where.scheduledAt = scheduledAt;
    }

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { tripNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: where as never,
        include: {
          pricing: true,
          assignment: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.trip.count({ where: where as never }),
    ]);

    return {
      items: trips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStatsForDriver(orgId: string, driverId: string) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const baseWhere = {
      orgId,
      deletedAt: null,
      assignment: { driverId },
    };

    const [todayTrips, pendingAcceptance, completedMonth, totalAssigned] =
      await Promise.all([
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            scheduledAt: { gte: startOfDay, lt: endOfDay },
          } as never,
        }),
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            status: TripStatus.ASSIGNED_INTERNAL,
            assignment: { driverId, isAccepted: null },
          } as never,
        }),
        this.prisma.trip.count({
          where: {
            ...baseWhere,
            status: TripStatus.COMPLETED,
            updatedAt: { gte: startOfMonth },
          } as never,
        }),
        this.prisma.trip.count({
          where: baseWhere as never,
        }),
      ]);

    return { todayTrips, pendingAcceptance, completedMonth, totalAssigned };
  }

  // --- Assignment ---

  async assignTrip(tripId: string, dto: AssignTripDto, actor: JwtPayload) {
    const trip = await this.findOne(tripId, actor.orgId);

    // Must be READY_FOR_ASSIGNMENT (or re-assigning from ASSIGNED states)
    const assignableStatuses: TripStatus[] = [
      TripStatus.READY_FOR_ASSIGNMENT,
      TripStatus.ASSIGNED_INTERNAL,
      TripStatus.ASSIGNED_SUB_AGENCY,
    ];
    if (!assignableStatuses.includes(trip.status)) {
      throw new BadRequestException(
        `Cannot assign trip in ${trip.status} status. Must be READY_FOR_ASSIGNMENT or currently assigned.`,
      );
    }

    // Validate assignment target
    if (dto.assignmentType === AssignmentType.INTERNAL) {
      if (!dto.driverId) {
        throw new BadRequestException(
          'driverId is required for internal assignment',
        );
      }
      const driver = await this.prisma.driver.findFirst({
        where: {
          id: dto.driverId,
          orgId: actor.orgId,
          isActive: true,
          deletedAt: null,
        },
      });
      if (!driver) {
        throw new NotFoundException('Driver not found or inactive');
      }
    } else {
      if (!dto.subAgencyId) {
        throw new BadRequestException(
          'subAgencyId is required for sub-agency assignment',
        );
      }
      const agency = await this.prisma.subAgency.findFirst({
        where: {
          id: dto.subAgencyId,
          orgId: actor.orgId,
          isActive: true,
          deletedAt: null,
        },
      });
      if (!agency) {
        throw new NotFoundException('Sub-agency not found or inactive');
      }
    }

    const newStatus =
      dto.assignmentType === AssignmentType.INTERNAL
        ? TripStatus.ASSIGNED_INTERNAL
        : TripStatus.ASSIGNED_SUB_AGENCY;

    return this.prisma.$transaction(async (tx) => {
      // Upsert assignment (tripId is unique)
      await tx.tripAssignment.upsert({
        where: { tripId },
        create: {
          tripId,
          assignmentType: dto.assignmentType,
          driverId:
            dto.assignmentType === AssignmentType.INTERNAL
              ? dto.driverId!
              : null,
          subAgencyId:
            dto.assignmentType === AssignmentType.SUB_AGENCY
              ? dto.subAgencyId!
              : null,
          isAccepted: null,
          declineReason: null,
          assignedAt: new Date(),
        },
        update: {
          assignmentType: dto.assignmentType,
          driverId:
            dto.assignmentType === AssignmentType.INTERNAL
              ? dto.driverId!
              : null,
          subAgencyId:
            dto.assignmentType === AssignmentType.SUB_AGENCY
              ? dto.subAgencyId!
              : null,
          isAccepted: null,
          declineReason: null,
          respondedAt: null,
          assignedAt: new Date(),
        },
      });

      // Update trip status
      await tx.trip.update({
        where: { id: tripId },
        data: { status: newStatus },
      });

      // Audit log
      await tx.tripStatusLog.create({
        data: {
          tripId,
          fromStatus: trip.status,
          toStatus: newStatus,
          actorId: actor.userId,
          actorRole: actor.role as never,
          notes: `Assigned to ${dto.assignmentType === AssignmentType.INTERNAL ? 'driver' : 'sub-agency'}`,
        },
      });

      const result = await this.findOne(tripId, actor.orgId);

      // System chat message
      const assigneeName =
        dto.assignmentType === AssignmentType.INTERNAL
          ? result.assignment?.driver?.name
          : result.assignment?.subAgency?.name;
      this.chatService
        .createSystemMessage(
          tripId,
          actor.userId,
          `Trip assigned to ${assigneeName || (dto.assignmentType === AssignmentType.INTERNAL ? 'driver' : 'sub-agency')}`,
        )
        .catch(() => {});

      return result;
    });
  }

  async acceptAssignment(tripId: string, actor: JwtPayload) {
    const trip = await this.findOne(tripId, actor.orgId);

    if (
      trip.status !== TripStatus.ASSIGNED_INTERNAL &&
      trip.status !== TripStatus.ASSIGNED_SUB_AGENCY
    ) {
      throw new BadRequestException('Trip is not in an assigned state');
    }

    if (!trip.assignment) {
      throw new BadRequestException('No assignment found for this trip');
    }

    await this.prisma.tripAssignment.update({
      where: { tripId },
      data: { isAccepted: true, respondedAt: new Date() },
    });

    // System chat message
    const user = await this.prisma.user.findUnique({
      where: { id: actor.userId },
      select: { name: true },
    });
    this.chatService
      .createSystemMessage(
        tripId,
        actor.userId,
        `${user?.name || 'Driver'} has accepted the trip`,
      )
      .catch(() => {});

    return this.findOne(tripId, actor.orgId);
  }

  async declineAssignment(
    tripId: string,
    dto: DeclineTripDto,
    actor: JwtPayload,
  ) {
    const trip = await this.findOne(tripId, actor.orgId);

    if (
      trip.status !== TripStatus.ASSIGNED_INTERNAL &&
      trip.status !== TripStatus.ASSIGNED_SUB_AGENCY
    ) {
      throw new BadRequestException('Trip is not in an assigned state');
    }

    await this.prisma.$transaction(async (tx) => {
      // Mark assignment as declined
      await tx.tripAssignment.update({
        where: { tripId },
        data: {
          isAccepted: false,
          declineReason: dto.reason || null,
          respondedAt: new Date(),
        },
      });

      // Return trip to assignment pool
      await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.READY_FOR_ASSIGNMENT },
      });

      // Audit log
      await tx.tripStatusLog.create({
        data: {
          tripId,
          fromStatus: trip.status,
          toStatus: TripStatus.READY_FOR_ASSIGNMENT,
          actorId: actor.userId,
          actorRole: actor.role as never,
          notes: dto.reason
            ? `Assignment declined: ${dto.reason}`
            : 'Assignment declined',
        },
      });
    });

    return this.findOne(tripId, actor.orgId);
  }

  private getAllowedTransitions(current: TripStatus): TripStatus[] {
    const map: Record<string, TripStatus[]> = {
      [TripStatus.DRAFT]: [TripStatus.CONFIRMED, TripStatus.CANCELLED],
      [TripStatus.CONFIRMED]: [
        TripStatus.READY_FOR_ASSIGNMENT,
        TripStatus.CANCELLED,
      ],
      [TripStatus.READY_FOR_ASSIGNMENT]: [
        TripStatus.ASSIGNED_INTERNAL,
        TripStatus.ASSIGNED_SUB_AGENCY,
        TripStatus.CANCELLED,
      ],
      [TripStatus.ASSIGNED_INTERNAL]: [
        TripStatus.ENROUTE,
        TripStatus.CANCELLED,
        TripStatus.NO_SHOW,
      ],
      [TripStatus.ASSIGNED_SUB_AGENCY]: [
        TripStatus.ENROUTE,
        TripStatus.CANCELLED,
        TripStatus.NO_SHOW,
      ],
      [TripStatus.ENROUTE]: [
        TripStatus.PICKED_UP,
        TripStatus.CANCELLED,
        TripStatus.NO_SHOW,
      ],
      [TripStatus.PICKED_UP]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
    };
    return map[current] || [];
  }

  // --- Helpers ---

  private async generateTripNumber(orgId: string): Promise<string> {
    const today = new Date();
    const dateStr =
      String(today.getFullYear()).slice(2) +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const count = await this.prisma.trip.count({
      where: {
        orgId,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });

    return `TRP-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  private async calculatePricing(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    orgId: string,
    serviceType: string,
    distanceKm?: number,
    estimatedFare?: number,
    finalFare?: number,
    overrideReason?: string,
  ) {
    // If fare is supplied directly, use it
    if (estimatedFare || finalFare) {
      return {
        distanceKm: distanceKm ?? null,
        estimatedFare: estimatedFare ?? null,
        finalFare: finalFare ?? null,
        overrideReason: overrideReason ?? null,
        isLocked: !!finalFare,
      };
    }

    // If distance provided, auto-calculate from pricing rules
    if (distanceKm && distanceKm > 0) {
      const rule = await tx.pricingRule.findFirst({
        where: {
          orgId,
          serviceType: serviceType as never,
          isActive: true,
          effectiveFrom: { lte: new Date() },
        },
        orderBy: { effectiveFrom: 'desc' },
      });

      if (rule) {
        let fare: number;
        if (distanceKm <= rule.includedKm) {
          fare = rule.minFare;
        } else {
          const extraKm = distanceKm - rule.includedKm;
          fare = Math.max(
            rule.minFare,
            rule.includedKm * rule.ratePerKm + extraKm * rule.extraKmRate,
          );
        }

        return {
          distanceKm,
          estimatedFare: Math.round(fare * 100) / 100,
          finalFare: null,
          pricingRuleId: rule.id,
          overrideReason: null,
          isLocked: false,
        };
      }
    }

    // No pricing info available
    if (distanceKm) {
      return {
        distanceKm,
        estimatedFare: null,
        finalFare: null,
        overrideReason: null,
        isLocked: false,
      };
    }

    return null;
  }
}
