import { ExpenseCategory } from '@prisma/client';
export declare class CreateExpenseDto {
    amount: number;
    category: ExpenseCategory;
    notes?: string;
}
