import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    create(tripId: string, dto: CreateExpenseDto, user: JwtPayload): Promise<{
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
    findByTrip(tripId: string, user: JwtPayload): Promise<({
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
    getSummary(tripId: string, user: JwtPayload): Promise<{
        total: number;
        pendingAmount: number;
        pendingCount: number;
        approvedAmount: number;
        approvedCount: number;
        rejectedAmount: number;
        rejectedCount: number;
    }>;
    approve(id: string, user: JwtPayload): Promise<{
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
    reject(id: string, dto: RejectExpenseDto, user: JwtPayload): Promise<{
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
}
