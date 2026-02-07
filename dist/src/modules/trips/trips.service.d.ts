import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryTripsDto } from './dto/query-trips.dto';
import { AssignTripDto } from './dto/assign-trip.dto';
import { DeclineTripDto } from './dto/decline-trip.dto';
import { CommissionsService } from '../commissions/commissions.service';
import { ChatService } from '../chat/chat.service';
export declare class TripsService {
    private prisma;
    private commissionsService;
    private chatService;
    constructor(prisma: PrismaService, commissionsService: CommissionsService, chatService: ChatService);
    create(dto: CreateTripDto, actor: JwtPayload): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    findAll(query: QueryTripsDto, orgId: string): Promise<{
        items: ({
            assignment: ({
                driver: {
                    id: string;
                    name: string;
                    phone: string;
                } | null;
                subAgency: {
                    id: string;
                    name: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                subAgencyId: string | null;
                driverId: string | null;
                tripId: string;
                assignmentType: import(".prisma/client").$Enums.AssignmentType;
                isAccepted: boolean | null;
                declineReason: string | null;
                assignedAt: Date;
                respondedAt: Date | null;
            }) | null;
            pricing: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tripId: string;
                distanceKm: number | null;
                estimatedFare: number | null;
                finalFare: number | null;
                overrideReason: string | null;
                isLocked: boolean;
                pricingRuleId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            deletedAt: Date | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            tripNumber: string;
            status: import(".prisma/client").$Enums.TripStatus;
            source: import(".prisma/client").$Enums.TripSource;
            customerName: string;
            customerPhone: string | null;
            customerEmail: string | null;
            pickupAddress: string;
            pickupLat: number | null;
            pickupLng: number | null;
            dropAddress: string;
            dropLat: number | null;
            dropLng: number | null;
            scheduledAt: Date;
            scheduledEndAt: Date | null;
            paxCount: number;
            luggageCount: number;
            notes: string | null;
            trackingToken: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(tripId: string, orgId: string): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    update(tripId: string, dto: UpdateTripDto, actor: JwtPayload): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    softDelete(tripId: string, orgId: string): Promise<{
        message: string;
    }>;
    updateStatus(tripId: string, dto: UpdateStatusDto, actor: JwtPayload): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    getTimeline(tripId: string, orgId: string): Promise<({
        actor: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        fromStatus: import(".prisma/client").$Enums.TripStatus | null;
        toStatus: import(".prisma/client").$Enums.TripStatus;
        actorRole: import(".prisma/client").$Enums.UserRole;
        tripId: string;
        actorId: string;
    })[]>;
    getStats(orgId: string): Promise<{
        todayTrips: number;
        needsAttention: number;
        completedToday: number;
        totalActive: number;
    }>;
    resolveSubAgencyId(userId: string): Promise<string>;
    findAllForSubAgency(query: QueryTripsDto, orgId: string, subAgencyId: string): Promise<{
        items: ({
            assignment: ({
                driver: {
                    id: string;
                    name: string;
                    phone: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                subAgencyId: string | null;
                driverId: string | null;
                tripId: string;
                assignmentType: import(".prisma/client").$Enums.AssignmentType;
                isAccepted: boolean | null;
                declineReason: string | null;
                assignedAt: Date;
                respondedAt: Date | null;
            }) | null;
            pricing: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tripId: string;
                distanceKm: number | null;
                estimatedFare: number | null;
                finalFare: number | null;
                overrideReason: string | null;
                isLocked: boolean;
                pricingRuleId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            deletedAt: Date | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            tripNumber: string;
            status: import(".prisma/client").$Enums.TripStatus;
            source: import(".prisma/client").$Enums.TripSource;
            customerName: string;
            customerPhone: string | null;
            customerEmail: string | null;
            pickupAddress: string;
            pickupLat: number | null;
            pickupLng: number | null;
            dropAddress: string;
            dropLat: number | null;
            dropLng: number | null;
            scheduledAt: Date;
            scheduledEndAt: Date | null;
            paxCount: number;
            luggageCount: number;
            notes: string | null;
            trackingToken: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStatsForSubAgency(orgId: string, subAgencyId: string): Promise<{
        todayTrips: number;
        pendingAcceptance: number;
        completedMonth: number;
        totalAssigned: number;
    }>;
    resolveDriverId(userId: string): Promise<string>;
    findAllForDriver(query: QueryTripsDto, orgId: string, driverId: string): Promise<{
        items: ({
            assignment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                subAgencyId: string | null;
                driverId: string | null;
                tripId: string;
                assignmentType: import(".prisma/client").$Enums.AssignmentType;
                isAccepted: boolean | null;
                declineReason: string | null;
                assignedAt: Date;
                respondedAt: Date | null;
            } | null;
            pricing: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tripId: string;
                distanceKm: number | null;
                estimatedFare: number | null;
                finalFare: number | null;
                overrideReason: string | null;
                isLocked: boolean;
                pricingRuleId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            orgId: string;
            deletedAt: Date | null;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            tripNumber: string;
            status: import(".prisma/client").$Enums.TripStatus;
            source: import(".prisma/client").$Enums.TripSource;
            customerName: string;
            customerPhone: string | null;
            customerEmail: string | null;
            pickupAddress: string;
            pickupLat: number | null;
            pickupLng: number | null;
            dropAddress: string;
            dropLat: number | null;
            dropLng: number | null;
            scheduledAt: Date;
            scheduledEndAt: Date | null;
            paxCount: number;
            luggageCount: number;
            notes: string | null;
            trackingToken: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStatsForDriver(orgId: string, driverId: string): Promise<{
        todayTrips: number;
        pendingAcceptance: number;
        completedMonth: number;
        totalAssigned: number;
    }>;
    assignTrip(tripId: string, dto: AssignTripDto, actor: JwtPayload): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    acceptAssignment(tripId: string, actor: JwtPayload): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    declineAssignment(tripId: string, dto: DeclineTripDto, actor: JwtPayload): Promise<{
        statusLogs: ({
            actor: {
                id: string;
                name: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            fromStatus: import(".prisma/client").$Enums.TripStatus | null;
            toStatus: import(".prisma/client").$Enums.TripStatus;
            actorRole: import(".prisma/client").$Enums.UserRole;
            tripId: string;
            actorId: string;
        })[];
        assignment: ({
            driver: {
                id: string;
                name: string;
                phone: string;
            } | null;
            subAgency: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string | null;
            driverId: string | null;
            tripId: string;
            assignmentType: import(".prisma/client").$Enums.AssignmentType;
            isAccepted: boolean | null;
            declineReason: string | null;
            assignedAt: Date;
            respondedAt: Date | null;
        }) | null;
        pricing: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            distanceKm: number | null;
            estimatedFare: number | null;
            finalFare: number | null;
            overrideReason: string | null;
            isLocked: boolean;
            pricingRuleId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        deletedAt: Date | null;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        source: import(".prisma/client").$Enums.TripSource;
        customerName: string;
        customerPhone: string | null;
        customerEmail: string | null;
        pickupAddress: string;
        pickupLat: number | null;
        pickupLng: number | null;
        dropAddress: string;
        dropLat: number | null;
        dropLng: number | null;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        paxCount: number;
        luggageCount: number;
        notes: string | null;
        trackingToken: string | null;
    }>;
    private getAllowedTransitions;
    private generateTripNumber;
    private calculatePricing;
}
