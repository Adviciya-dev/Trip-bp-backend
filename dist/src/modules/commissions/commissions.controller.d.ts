import { CommissionsService } from './commissions.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class CommissionsController {
    private commissionsService;
    constructor(commissionsService: CommissionsService);
    findAllRules(subAgencyId: string | undefined, user: JwtPayload): Promise<({
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
    createRule(dto: CreateCommissionRuleDto, user: JwtPayload): Promise<{
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
    updateRule(id: string, dto: UpdateCommissionRuleDto, user: JwtPayload): Promise<{
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
    findAllLedger(query: QueryCommissionsDto, user: JwtPayload): Promise<{
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
    getLedgerStats(user: JwtPayload): Promise<{
        pendingAmount: number;
        pendingCount: number;
        approvedAmount: number;
        approvedCount: number;
        monthAmount: number;
    }>;
    approve(id: string, user: JwtPayload): Promise<{
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
    reject(id: string, user: JwtPayload): Promise<{
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
    bulkApprove(body: {
        ids: string[];
    }, user: JwtPayload): Promise<{
        approved: number;
    }>;
    findAgencyLedger(query: QueryCommissionsDto, user: JwtPayload): Promise<{
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
    getAgencyLedgerStats(user: JwtPayload): Promise<{
        pendingAmount: number;
        pendingCount: number;
        approvedAmount: number;
        approvedCount: number;
        monthAmount: number;
    }>;
}
