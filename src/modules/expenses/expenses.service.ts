import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpenseStatus } from '@prisma/client';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  /** Resolve driverId from userId */
  async resolveDriverId(userId: string): Promise<string> {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!driver) throw new ForbiddenException('No driver profile linked');
    return driver.id;
  }

  /** Submit an expense for a trip (driver only) */
  async create(tripId: string, dto: CreateExpenseDto, actor: JwtPayload) {
    const driverId = await this.resolveDriverId(actor.userId);

    // Verify the trip exists, belongs to org, and driver is assigned
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, orgId: actor.orgId },
      include: { assignment: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (!trip.assignment || trip.assignment.driverId !== driverId) {
      throw new ForbiddenException('You are not assigned to this trip');
    }

    return this.prisma.tripExpense.create({
      data: {
        tripId,
        driverId,
        amount: dto.amount,
        category: dto.category,
        notes: dto.notes,
      } as never,
    });
  }

  /** List expenses for a trip */
  async findByTrip(tripId: string, orgId: string) {
    // Verify trip belongs to org
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, orgId },
      select: { id: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');

    return this.prisma.tripExpense.findMany({
      where: { tripId },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get expense summary for a trip */
  async getTripExpenseSummary(tripId: string, orgId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, orgId },
      select: { id: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');

    const expenses = await this.prisma.tripExpense.findMany({
      where: { tripId },
      select: { amount: true, status: true },
    });

    let pendingAmount = 0;
    let approvedAmount = 0;
    let rejectedAmount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    for (const e of expenses) {
      if (e.status === ExpenseStatus.PENDING) {
        pendingAmount += e.amount;
        pendingCount++;
      } else if (e.status === ExpenseStatus.APPROVED) {
        approvedAmount += e.amount;
        approvedCount++;
      } else {
        rejectedAmount += e.amount;
        rejectedCount++;
      }
    }

    return {
      total: expenses.length,
      pendingAmount,
      pendingCount,
      approvedAmount,
      approvedCount,
      rejectedAmount,
      rejectedCount,
    };
  }

  /** Approve an expense (ops only) */
  async approve(expenseId: string, orgId: string) {
    const expense = await this.findExpenseOrFail(expenseId, orgId);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve expense in ${expense.status} status`,
      );
    }

    return this.prisma.tripExpense.update({
      where: { id: expenseId },
      data: { status: ExpenseStatus.APPROVED },
    });
  }

  /** Reject an expense (ops only) */
  async reject(expenseId: string, dto: RejectExpenseDto, orgId: string) {
    const expense = await this.findExpenseOrFail(expenseId, orgId);

    if (expense.status !== ExpenseStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject expense in ${expense.status} status`,
      );
    }

    return this.prisma.tripExpense.update({
      where: { id: expenseId },
      data: {
        status: ExpenseStatus.REJECTED,
        rejectReason: dto.reason,
      },
    });
  }

  /** Helper: find expense + verify org ownership */
  private async findExpenseOrFail(expenseId: string, orgId: string) {
    const expense = await this.prisma.tripExpense.findUnique({
      where: { id: expenseId },
      include: { trip: { select: { orgId: true } } },
    });

    if (!expense || expense.trip.orgId !== orgId) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }
}
