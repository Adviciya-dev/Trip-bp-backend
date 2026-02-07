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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const commissions_service_1 = require("../commissions/commissions.service");
const chat_service_1 = require("../chat/chat.service");
const STATUS_MESSAGES = {
    CONFIRMED: 'Trip confirmed',
    READY_FOR_ASSIGNMENT: 'Trip is ready for assignment',
    ENROUTE: 'Driver is en route',
    PICKED_UP: 'Passenger picked up',
    COMPLETED: 'Trip completed',
    CANCELLED: 'Trip cancelled',
    NO_SHOW: 'Marked as no-show',
};
let TripsService = class TripsService {
    prisma;
    commissionsService;
    chatService;
    constructor(prisma, commissionsService, chatService) {
        this.prisma = prisma;
        this.commissionsService = commissionsService;
        this.chatService = chatService;
    }
    async create(dto, actor) {
        const tripNumber = await this.generateTripNumber(actor.orgId);
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
                    status: client_1.TripStatus.DRAFT,
                },
            });
            const pricing = await this.calculatePricing(tx, actor.orgId, dto.serviceType, dto.distanceKm, dto.estimatedFare, dto.finalFare, dto.overrideReason);
            if (pricing) {
                await tx.tripPricing.create({
                    data: {
                        tripId: trip.id,
                        ...pricing,
                    },
                });
            }
            await tx.tripStatusLog.create({
                data: {
                    tripId: trip.id,
                    fromStatus: null,
                    toStatus: client_1.TripStatus.DRAFT,
                    actorId: actor.userId,
                    actorRole: actor.role,
                    notes: 'Trip created',
                },
            });
            return trip;
        });
        return this.findOne(created.id, actor.orgId);
    }
    async findAll(query, orgId) {
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const skip = (page - 1) * limit;
        const where = {
            orgId,
            deletedAt: null,
        };
        if (query.status)
            where.status = query.status;
        if (query.serviceType)
            where.serviceType = query.serviceType;
        if (query.from || query.to) {
            const scheduledAt = {};
            if (query.from)
                scheduledAt.gte = new Date(query.from);
            if (query.to)
                scheduledAt.lte = new Date(query.to);
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
                where: where,
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
            this.prisma.trip.count({ where: where }),
        ]);
        return {
            items: trips,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(tripId, orgId) {
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
            throw new common_1.NotFoundException('Trip not found');
        }
        return trip;
    }
    async update(tripId, dto, actor) {
        const existing = await this.findOne(tripId, actor.orgId);
        const statusChanged = dto.status && dto.status !== existing.status;
        await this.prisma.$transaction(async (tx) => {
            const { distanceKm, estimatedFare, finalFare, overrideReason, ...tripData } = dto;
            const updateData = {};
            if (tripData.serviceType)
                updateData.serviceType = tripData.serviceType;
            if (tripData.status)
                updateData.status = tripData.status;
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
            if (tripData.dropAddress)
                updateData.dropAddress = tripData.dropAddress;
            if (tripData.dropLat !== undefined)
                updateData.dropLat = tripData.dropLat;
            if (tripData.dropLng !== undefined)
                updateData.dropLng = tripData.dropLng;
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
            if (tripData.notes !== undefined)
                updateData.notes = tripData.notes;
            await tx.trip.update({
                where: { id: tripId },
                data: updateData,
            });
            if (distanceKm !== undefined ||
                estimatedFare !== undefined ||
                finalFare !== undefined) {
                const pricingData = {};
                if (distanceKm !== undefined)
                    pricingData.distanceKm = distanceKm;
                if (estimatedFare !== undefined)
                    pricingData.estimatedFare = estimatedFare;
                if (finalFare !== undefined) {
                    pricingData.finalFare = finalFare;
                    pricingData.isLocked = true;
                }
                if (overrideReason)
                    pricingData.overrideReason = overrideReason;
                await tx.tripPricing.upsert({
                    where: { tripId },
                    create: { tripId, ...pricingData },
                    update: pricingData,
                });
            }
            if (statusChanged && dto.status) {
                await tx.tripStatusLog.create({
                    data: {
                        tripId,
                        fromStatus: existing.status,
                        toStatus: dto.status,
                        actorId: actor.userId,
                        actorRole: actor.role,
                    },
                });
            }
        });
        return this.findOne(tripId, actor.orgId);
    }
    async softDelete(tripId, orgId) {
        const trip = await this.findOne(tripId, orgId);
        if (trip.status !== client_1.TripStatus.DRAFT &&
            trip.status !== client_1.TripStatus.CANCELLED) {
            throw new common_1.BadRequestException('Only DRAFT or CANCELLED trips can be deleted');
        }
        await this.prisma.trip.update({
            where: { id: tripId },
            data: { deletedAt: new Date() },
        });
        return { message: 'Trip deleted' };
    }
    async updateStatus(tripId, dto, actor) {
        const existing = await this.findOne(tripId, actor.orgId);
        const allowed = this.getAllowedTransitions(existing.status);
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition from ${existing.status} to ${dto.status}`);
        }
        await this.prisma.$transaction(async (tx) => {
            const updateData = { status: dto.status };
            if (dto.status === client_1.TripStatus.CONFIRMED && !existing.trackingToken) {
                updateData.trackingToken = (0, crypto_1.randomUUID)();
            }
            await tx.trip.update({
                where: { id: tripId },
                data: updateData,
            });
            await tx.tripStatusLog.create({
                data: {
                    tripId,
                    fromStatus: existing.status,
                    toStatus: dto.status,
                    actorId: actor.userId,
                    actorRole: actor.role,
                    notes: dto.notes,
                },
            });
        });
        const updatedTrip = await this.findOne(tripId, actor.orgId);
        if (dto.status === client_1.TripStatus.COMPLETED &&
            existing.assignment?.subAgencyId) {
            this.commissionsService
                .calculateCommission(tripId, actor.orgId)
                .catch(() => { });
        }
        const statusMsg = STATUS_MESSAGES[dto.status];
        if (statusMsg) {
            this.chatService
                .createSystemMessage(tripId, actor.userId, statusMsg)
                .catch(() => { });
        }
        return updatedTrip;
    }
    async getTimeline(tripId, orgId) {
        await this.findOne(tripId, orgId);
        return this.prisma.tripStatusLog.findMany({
            where: { tripId },
            include: {
                actor: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getStats(orgId) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const baseWhere = { orgId, deletedAt: null };
        const [todayTrips, needsAttention, completedToday, totalActive] = await Promise.all([
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
                    status: client_1.TripStatus.COMPLETED,
                    updatedAt: { gte: startOfDay, lt: endOfDay },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: {
                        notIn: [
                            client_1.TripStatus.COMPLETED,
                            client_1.TripStatus.CANCELLED,
                            client_1.TripStatus.NO_SHOW,
                        ],
                    },
                },
            }),
        ]);
        return { todayTrips, needsAttention, completedToday, totalActive };
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
    async findAllForSubAgency(query, orgId, subAgencyId) {
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const skip = (page - 1) * limit;
        const where = {
            orgId,
            deletedAt: null,
            assignment: { subAgencyId },
        };
        if (query.status)
            where.status = query.status;
        if (query.from || query.to) {
            const scheduledAt = {};
            if (query.from)
                scheduledAt.gte = new Date(query.from);
            if (query.to)
                scheduledAt.lte = new Date(query.to);
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
                where: where,
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
            this.prisma.trip.count({ where: where }),
        ]);
        return {
            items: trips,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStatsForSubAgency(orgId, subAgencyId) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const baseWhere = {
            orgId,
            deletedAt: null,
            assignment: { subAgencyId },
        };
        const [todayTrips, pendingAcceptance, completedMonth, totalAssigned] = await Promise.all([
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    scheduledAt: { gte: startOfDay, lt: endOfDay },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: client_1.TripStatus.ASSIGNED_SUB_AGENCY,
                    assignment: { subAgencyId, isAccepted: null },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: client_1.TripStatus.COMPLETED,
                    updatedAt: { gte: startOfMonth },
                },
            }),
            this.prisma.trip.count({
                where: baseWhere,
            }),
        ]);
        return { todayTrips, pendingAcceptance, completedMonth, totalAssigned };
    }
    async resolveDriverId(userId) {
        const driver = await this.prisma.driver.findFirst({
            where: { userId, deletedAt: null },
            select: { id: true },
        });
        if (!driver) {
            throw new common_1.BadRequestException('User is not linked to a driver profile');
        }
        return driver.id;
    }
    async findAllForDriver(query, orgId, driverId) {
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const skip = (page - 1) * limit;
        const where = {
            orgId,
            deletedAt: null,
            assignment: { driverId },
        };
        if (query.status)
            where.status = query.status;
        if (query.from || query.to) {
            const scheduledAt = {};
            if (query.from)
                scheduledAt.gte = new Date(query.from);
            if (query.to)
                scheduledAt.lte = new Date(query.to);
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
                where: where,
                include: {
                    pricing: true,
                    assignment: true,
                },
                orderBy: { scheduledAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.trip.count({ where: where }),
        ]);
        return {
            items: trips,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStatsForDriver(orgId, driverId) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const baseWhere = {
            orgId,
            deletedAt: null,
            assignment: { driverId },
        };
        const [todayTrips, pendingAcceptance, completedMonth, totalAssigned] = await Promise.all([
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    scheduledAt: { gte: startOfDay, lt: endOfDay },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: client_1.TripStatus.ASSIGNED_INTERNAL,
                    assignment: { driverId, isAccepted: null },
                },
            }),
            this.prisma.trip.count({
                where: {
                    ...baseWhere,
                    status: client_1.TripStatus.COMPLETED,
                    updatedAt: { gte: startOfMonth },
                },
            }),
            this.prisma.trip.count({
                where: baseWhere,
            }),
        ]);
        return { todayTrips, pendingAcceptance, completedMonth, totalAssigned };
    }
    async assignTrip(tripId, dto, actor) {
        const trip = await this.findOne(tripId, actor.orgId);
        const assignableStatuses = [
            client_1.TripStatus.READY_FOR_ASSIGNMENT,
            client_1.TripStatus.ASSIGNED_INTERNAL,
            client_1.TripStatus.ASSIGNED_SUB_AGENCY,
        ];
        if (!assignableStatuses.includes(trip.status)) {
            throw new common_1.BadRequestException(`Cannot assign trip in ${trip.status} status. Must be READY_FOR_ASSIGNMENT or currently assigned.`);
        }
        if (dto.assignmentType === client_1.AssignmentType.INTERNAL) {
            if (!dto.driverId) {
                throw new common_1.BadRequestException('driverId is required for internal assignment');
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
                throw new common_1.NotFoundException('Driver not found or inactive');
            }
        }
        else {
            if (!dto.subAgencyId) {
                throw new common_1.BadRequestException('subAgencyId is required for sub-agency assignment');
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
                throw new common_1.NotFoundException('Sub-agency not found or inactive');
            }
        }
        const newStatus = dto.assignmentType === client_1.AssignmentType.INTERNAL
            ? client_1.TripStatus.ASSIGNED_INTERNAL
            : client_1.TripStatus.ASSIGNED_SUB_AGENCY;
        return this.prisma.$transaction(async (tx) => {
            await tx.tripAssignment.upsert({
                where: { tripId },
                create: {
                    tripId,
                    assignmentType: dto.assignmentType,
                    driverId: dto.assignmentType === client_1.AssignmentType.INTERNAL
                        ? dto.driverId
                        : null,
                    subAgencyId: dto.assignmentType === client_1.AssignmentType.SUB_AGENCY
                        ? dto.subAgencyId
                        : null,
                    isAccepted: null,
                    declineReason: null,
                    assignedAt: new Date(),
                },
                update: {
                    assignmentType: dto.assignmentType,
                    driverId: dto.assignmentType === client_1.AssignmentType.INTERNAL
                        ? dto.driverId
                        : null,
                    subAgencyId: dto.assignmentType === client_1.AssignmentType.SUB_AGENCY
                        ? dto.subAgencyId
                        : null,
                    isAccepted: null,
                    declineReason: null,
                    respondedAt: null,
                    assignedAt: new Date(),
                },
            });
            await tx.trip.update({
                where: { id: tripId },
                data: { status: newStatus },
            });
            await tx.tripStatusLog.create({
                data: {
                    tripId,
                    fromStatus: trip.status,
                    toStatus: newStatus,
                    actorId: actor.userId,
                    actorRole: actor.role,
                    notes: `Assigned to ${dto.assignmentType === client_1.AssignmentType.INTERNAL ? 'driver' : 'sub-agency'}`,
                },
            });
            const result = await this.findOne(tripId, actor.orgId);
            const assigneeName = dto.assignmentType === client_1.AssignmentType.INTERNAL
                ? result.assignment?.driver?.name
                : result.assignment?.subAgency?.name;
            this.chatService
                .createSystemMessage(tripId, actor.userId, `Trip assigned to ${assigneeName || (dto.assignmentType === client_1.AssignmentType.INTERNAL ? 'driver' : 'sub-agency')}`)
                .catch(() => { });
            return result;
        });
    }
    async acceptAssignment(tripId, actor) {
        const trip = await this.findOne(tripId, actor.orgId);
        if (trip.status !== client_1.TripStatus.ASSIGNED_INTERNAL &&
            trip.status !== client_1.TripStatus.ASSIGNED_SUB_AGENCY) {
            throw new common_1.BadRequestException('Trip is not in an assigned state');
        }
        if (!trip.assignment) {
            throw new common_1.BadRequestException('No assignment found for this trip');
        }
        await this.prisma.tripAssignment.update({
            where: { tripId },
            data: { isAccepted: true, respondedAt: new Date() },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: actor.userId },
            select: { name: true },
        });
        this.chatService
            .createSystemMessage(tripId, actor.userId, `${user?.name || 'Driver'} has accepted the trip`)
            .catch(() => { });
        return this.findOne(tripId, actor.orgId);
    }
    async declineAssignment(tripId, dto, actor) {
        const trip = await this.findOne(tripId, actor.orgId);
        if (trip.status !== client_1.TripStatus.ASSIGNED_INTERNAL &&
            trip.status !== client_1.TripStatus.ASSIGNED_SUB_AGENCY) {
            throw new common_1.BadRequestException('Trip is not in an assigned state');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.tripAssignment.update({
                where: { tripId },
                data: {
                    isAccepted: false,
                    declineReason: dto.reason || null,
                    respondedAt: new Date(),
                },
            });
            await tx.trip.update({
                where: { id: tripId },
                data: { status: client_1.TripStatus.READY_FOR_ASSIGNMENT },
            });
            await tx.tripStatusLog.create({
                data: {
                    tripId,
                    fromStatus: trip.status,
                    toStatus: client_1.TripStatus.READY_FOR_ASSIGNMENT,
                    actorId: actor.userId,
                    actorRole: actor.role,
                    notes: dto.reason
                        ? `Assignment declined: ${dto.reason}`
                        : 'Assignment declined',
                },
            });
        });
        return this.findOne(tripId, actor.orgId);
    }
    getAllowedTransitions(current) {
        const map = {
            [client_1.TripStatus.DRAFT]: [client_1.TripStatus.CONFIRMED, client_1.TripStatus.CANCELLED],
            [client_1.TripStatus.CONFIRMED]: [
                client_1.TripStatus.READY_FOR_ASSIGNMENT,
                client_1.TripStatus.CANCELLED,
            ],
            [client_1.TripStatus.READY_FOR_ASSIGNMENT]: [
                client_1.TripStatus.ASSIGNED_INTERNAL,
                client_1.TripStatus.ASSIGNED_SUB_AGENCY,
                client_1.TripStatus.CANCELLED,
            ],
            [client_1.TripStatus.ASSIGNED_INTERNAL]: [
                client_1.TripStatus.ENROUTE,
                client_1.TripStatus.CANCELLED,
                client_1.TripStatus.NO_SHOW,
            ],
            [client_1.TripStatus.ASSIGNED_SUB_AGENCY]: [
                client_1.TripStatus.ENROUTE,
                client_1.TripStatus.CANCELLED,
                client_1.TripStatus.NO_SHOW,
            ],
            [client_1.TripStatus.ENROUTE]: [
                client_1.TripStatus.PICKED_UP,
                client_1.TripStatus.CANCELLED,
                client_1.TripStatus.NO_SHOW,
            ],
            [client_1.TripStatus.PICKED_UP]: [client_1.TripStatus.COMPLETED, client_1.TripStatus.CANCELLED],
        };
        return map[current] || [];
    }
    async generateTripNumber(orgId) {
        const today = new Date();
        const dateStr = String(today.getFullYear()).slice(2) +
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
    async calculatePricing(tx, orgId, serviceType, distanceKm, estimatedFare, finalFare, overrideReason) {
        if (estimatedFare || finalFare) {
            return {
                distanceKm: distanceKm ?? null,
                estimatedFare: estimatedFare ?? null,
                finalFare: finalFare ?? null,
                overrideReason: overrideReason ?? null,
                isLocked: !!finalFare,
            };
        }
        if (distanceKm && distanceKm > 0) {
            const rule = await tx.pricingRule.findFirst({
                where: {
                    orgId,
                    serviceType: serviceType,
                    isActive: true,
                    effectiveFrom: { lte: new Date() },
                },
                orderBy: { effectiveFrom: 'desc' },
            });
            if (rule) {
                let fare;
                if (distanceKm <= rule.includedKm) {
                    fare = rule.minFare;
                }
                else {
                    const extraKm = distanceKm - rule.includedKm;
                    fare = Math.max(rule.minFare, rule.includedKm * rule.ratePerKm + extraKm * rule.extraKmRate);
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
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        commissions_service_1.CommissionsService,
        chat_service_1.ChatService])
], TripsService);
//# sourceMappingURL=trips.service.js.map