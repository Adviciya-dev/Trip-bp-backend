import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(orgId: string): Promise<{
        todayTrips: {
            value: number;
            yesterday: number;
        };
        inProgress: {
            value: number;
            yesterday: number;
        };
        completedToday: {
            value: number;
            yesterday: number;
        };
        pendingAssignment: {
            value: number;
            yesterday: number;
        };
    }>;
    getActivity(orgId: string): Promise<{
        id: string;
        tripNumber: string;
        tripId: string;
        actorName: string;
        actorRole: import(".prisma/client").$Enums.UserRole;
        fromStatus: import(".prisma/client").$Enums.TripStatus | null;
        toStatus: import(".prisma/client").$Enums.TripStatus;
        notes: string | null;
        createdAt: Date;
    }[]>;
    getRevenue(orgId: string): Promise<{
        todayRevenue: number;
        weekRevenue: number;
        daily: {
            date: string;
            revenue: number;
        }[];
    }>;
    getTodayTrips(orgId: string): Promise<{
        id: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        customerName: string;
        pickupAddress: string;
        dropAddress: string;
        scheduledAt: Date;
        assignment: {
            driver: {
                name: string;
            } | null;
            subAgency: {
                name: string;
            } | null;
        } | null;
    }[]>;
}
