import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    resolveDriverId(userId: string): Promise<string>;
    create(tripId: string, dto: CreateExpenseDto, actor: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        notes: string | null;
        tripId: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        rejectReason: string | null;
    }>;
    findByTrip(tripId: string, orgId: string): Promise<({
        driver: {
            id: string;
            name: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        notes: string | null;
        tripId: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        rejectReason: string | null;
    })[]>;
    getTripExpenseSummary(tripId: string, orgId: string): Promise<{
        total: number;
        pendingAmount: number;
        pendingCount: number;
        approvedAmount: number;
        approvedCount: number;
        rejectedAmount: number;
        rejectedCount: number;
    }>;
    approve(expenseId: string, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        notes: string | null;
        tripId: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        rejectReason: string | null;
    }>;
    reject(expenseId: string, dto: RejectExpenseDto, orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        driverId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        notes: string | null;
        tripId: string;
        amount: number;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        rejectReason: string | null;
    }>;
    private findExpenseOrFail;
}
