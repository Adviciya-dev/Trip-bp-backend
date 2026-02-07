import { PrismaService } from '../../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getTripReport(orgId: string, query: ReportQueryDto): Promise<{
        items: {
            id: string;
            tripNumber: string;
            scheduledAt: Date;
            customerName: string;
            serviceType: import(".prisma/client").$Enums.ServiceType;
            pickupAddress: string;
            dropAddress: string;
            status: import(".prisma/client").$Enums.TripStatus;
            assignedTo: string | null;
            assignmentType: import(".prisma/client").$Enums.AssignmentType | null;
            fare: number | null;
        }[];
        summary: {
            total: number;
            completed: number;
            cancelled: number;
            avgFare: number;
        };
    }>;
    getRevenueReport(orgId: string, query: ReportQueryDto): Promise<{
        summary: {
            totalRevenue: number;
            internalRevenue: number;
            subAgencyRevenue: number;
            totalExpenses: number;
            netRevenue: number;
            tripCount: number;
        };
        daily: {
            date: string;
            revenue: number;
            trips: number;
            expenses: number;
        }[];
    }>;
    getCommissionReport(orgId: string, query: ReportQueryDto): Promise<{
        items: {
            id: string;
            tripNumber: string;
            scheduledAt: Date;
            subAgencyName: string;
            fareAmount: number;
            commission: number;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
        }[];
        byAgency: {
            subAgencyId: string;
            subAgencyName: string;
            tripCount: number;
            totalFare: number;
            totalCommission: number;
            pendingAmount: number;
            approvedAmount: number;
        }[];
        summary: {
            totalPending: number;
            totalApproved: number;
            totalCommissions: number;
        };
    }>;
    exportCsv(orgId: string, type: string, query: ReportQueryDto): Promise<{
        filename: string;
        content: string;
    }>;
    private buildTripWhere;
    private getDateRangeLabel;
    private toCsv;
}
