"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveDriverId(userId) {
        const driver = await this.prisma.driver.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!driver)
            throw new common_1.ForbiddenException('No driver profile linked');
        return driver.id;
    }
    async create(tripId, dto, actor) {
        const driverId = await this.resolveDriverId(actor.userId);
        const trip = await this.prisma.trip.findFirst({
            where: { id: tripId, orgId: actor.orgId },
            include: { assignment: true },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
        if (!trip.assignment || trip.assignment.driverId !== driverId) {
            throw new common_1.ForbiddenException('You are not assigned to this trip');
        }
        return this.prisma.tripExpense.create({
            data: {
                tripId,
                driverId,
                amount: dto.amount,
                category: dto.category,
                notes: dto.notes,
            },
        });
    }
    async findByTrip(tripId, orgId) {
        const trip = await this.prisma.trip.findFirst({
            where: { id: tripId, orgId },
            select: { id: true },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
        return this.prisma.tripExpense.findMany({
            where: { tripId },
            include: {
                driver: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTripExpenseSummary(tripId, orgId) {
        const trip = await this.prisma.trip.findFirst({
            where: { id: tripId, orgId },
            select: { id: true },
        });
        if (!trip)
            throw new common_1.NotFoundException('Trip not found');
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
            if (e.status === client_1.ExpenseStatus.PENDING) {
                pendingAmount += e.amount;
                pendingCount++;
            }
            else if (e.status === client_1.ExpenseStatus.APPROVED) {
                approvedAmount += e.amount;
                approvedCount++;
            }
            else {
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
    async approve(expenseId, orgId) {
        const expense = await this.findExpenseOrFail(expenseId, orgId);
        if (expense.status !== client_1.ExpenseStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot approve expense in ${expense.status} status`);
        }
        return this.prisma.tripExpense.update({
            where: { id: expenseId },
            data: { status: client_1.ExpenseStatus.APPROVED },
        });
    }
    async reject(expenseId, dto, orgId) {
        const expense = await this.findExpenseOrFail(expenseId, orgId);
        if (expense.status !== client_1.ExpenseStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot reject expense in ${expense.status} status`);
        }
        return this.prisma.tripExpense.update({
            where: { id: expenseId },
            data: {
                status: client_1.ExpenseStatus.REJECTED,
                rejectReason: dto.reason,
            },
        });
    }
    async findExpenseOrFail(expenseId, orgId) {
        const expense = await this.prisma.tripExpense.findUnique({
            where: { id: expenseId },
            include: { trip: { select: { orgId: true } } },
        });
        if (!expense || expense.trip.orgId !== orgId) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return expense;
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map