import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryTripsDto } from './dto/query-trips.dto';
import { AssignTripDto } from './dto/assign-trip.dto';
import { DeclineTripDto } from './dto/decline-trip.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class TripsController {
    private tripsService;
    constructor(tripsService: TripsService);
    create(dto: CreateTripDto, user: JwtPayload): Promise<{
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
    findAll(query: QueryTripsDto, user: JwtPayload): Promise<{
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
    getStats(user: JwtPayload): Promise<{
        todayTrips: number;
        needsAttention: number;
        completedToday: number;
        totalActive: number;
    }>;
    findAllForAgency(query: QueryTripsDto, user: JwtPayload): Promise<{
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
    getAgencyStats(user: JwtPayload): Promise<{
        todayTrips: number;
        pendingAcceptance: number;
        completedMonth: number;
        totalAssigned: number;
    }>;
    findAllForDriver(query: QueryTripsDto, user: JwtPayload): Promise<{
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
    getDriverStats(user: JwtPayload): Promise<{
        todayTrips: number;
        pendingAcceptance: number;
        completedMonth: number;
        totalAssigned: number;
    }>;
    findOne(id: string, user: JwtPayload): Promise<{
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
    getTimeline(id: string, user: JwtPayload): Promise<({
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
    updateStatus(id: string, dto: UpdateStatusDto, user: JwtPayload): Promise<{
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
    assignTrip(id: string, dto: AssignTripDto, user: JwtPayload): Promise<{
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
    acceptAssignment(id: string, user: JwtPayload): Promise<{
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
    declineAssignment(id: string, dto: DeclineTripDto, user: JwtPayload): Promise<{
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
    update(id: string, dto: UpdateTripDto, user: JwtPayload): Promise<{
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
    remove(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
}
