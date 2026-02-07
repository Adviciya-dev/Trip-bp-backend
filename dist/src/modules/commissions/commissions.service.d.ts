import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
export declare class CommissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllRules(orgId: string, subAgencyId?: string): Promise<({
        subAgency: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        subAgencyId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        commissionType: import(".prisma/client").$Enums.CommissionType;
        value: number;
        commissionBase: import(".prisma/client").$Enums.CommissionBase;
    })[]>;
    createRule(dto: CreateCommissionRuleDto, orgId: string): Promise<{
        subAgency: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        subAgencyId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        commissionType: import(".prisma/client").$Enums.CommissionType;
        value: number;
        commissionBase: import(".prisma/client").$Enums.CommissionBase;
    }>;
    updateRule(ruleId: string, dto: UpdateCommissionRuleDto, orgId: string): Promise<{
        subAgency: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        subAgencyId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        commissionType: import(".prisma/client").$Enums.CommissionType;
        value: number;
        commissionBase: import(".prisma/client").$Enums.CommissionBase;
    }>;
    calculateCommission(tripId: string, orgId: string): Promise<void>;
    private findApplicableRule;
    findAllLedger(query: QueryCommissionsDto, orgId: string): Promise<{
        items: ({
            subAgency: {
                id: string;
                name: string;
            };
            trip: {
                serviceType: import(".prisma/client").$Enums.ServiceType;
                tripNumber: string;
                status: import(".prisma/client").$Enums.TripStatus;
                customerName: string;
                scheduledAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            commission: number;
            tripId: string;
            fareAmount: number;
            approvedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLedgerStats(orgId: string, subAgencyId?: string): Promise<{
        pendingAmount: number;
        pendingCount: number;
        approvedAmount: number;
        approvedCount: number;
        monthAmount: number;
    }>;
    approveCommission(ledgerId: string, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subAgencyId: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        commission: number;
        tripId: string;
        fareAmount: number;
        approvedAt: Date | null;
    }>;
    rejectCommission(ledgerId: string, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subAgencyId: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        commission: number;
        tripId: string;
        fareAmount: number;
        approvedAt: Date | null;
    }>;
    bulkApprove(ledgerIds: string[], orgId: string): Promise<{
        approved: number;
    }>;
    resolveSubAgencyId(userId: string): Promise<string>;
    findLedgerForSubAgency(query: QueryCommissionsDto, orgId: string, subAgencyId: string): Promise<{
        items: ({
            trip: {
                serviceType: import(".prisma/client").$Enums.ServiceType;
                tripNumber: string;
                customerName: string;
                scheduledAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            subAgencyId: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            commission: number;
            tripId: string;
            fareAmount: number;
            approvedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
