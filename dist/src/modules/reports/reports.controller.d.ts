import { StreamableFile } from '@nestjs/common';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
export declare class ReportsController {
    private reportsService;
    constructor(reportsService: ReportsService);
    getTripReport(user: JwtPayload, query: ReportQueryDto): Promise<{
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
    getRevenueReport(user: JwtPayload, query: ReportQueryDto): Promise<{
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
    getCommissionReport(user: JwtPayload, query: ReportQueryDto): Promise<{
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
    exportCsv(user: JwtPayload, type: string, query: ReportQueryDto): Promise<StreamableFile>;
}
