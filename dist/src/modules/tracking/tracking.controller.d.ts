import { PrismaService } from '../../prisma/prisma.service';
export declare class TrackingController {
    private prisma;
    constructor(prisma: PrismaService);
    getByToken(token: string): Promise<{
        expired: boolean;
        status: import(".prisma/client").$Enums.TripStatus;
        message: string;
        orgName?: undefined;
        orgLogo?: undefined;
        tripNumber?: undefined;
        serviceType?: undefined;
        scheduledAt?: undefined;
        scheduledEndAt?: undefined;
        pickupAddress?: undefined;
        dropAddress?: undefined;
        paxCount?: undefined;
        driver?: undefined;
        timeline?: undefined;
    } | {
        expired: boolean;
        orgName: string;
        orgLogo: string | null;
        tripNumber: string;
        status: import(".prisma/client").$Enums.TripStatus;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        scheduledAt: Date;
        scheduledEndAt: Date | null;
        pickupAddress: string;
        dropAddress: string;
        paxCount: number;
        driver: {
            name: string;
            phone: string;
        } | null;
        timeline: {
            status: import(".prisma/client").$Enums.TripStatus;
            at: Date;
        }[];
        message?: undefined;
    }>;
}
