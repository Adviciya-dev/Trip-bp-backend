import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { RejectExpenseDto } from './dto/reject-expense.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  /** Driver submits an expense for a trip */
  @Post('trips/:tripId/expenses')
  @Roles('DRIVER')
  create(
    @Param('tripId') tripId: string,
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.expensesService.create(tripId, dto, user);
  }

  /** List expenses for a trip (all roles) */
  @Get('trips/:tripId/expenses')
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER')
  findByTrip(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.expensesService.findByTrip(tripId, user.orgId);
  }

  /** Expense summary for a trip */
  @Get('trips/:tripId/expenses/summary')
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER')
  getSummary(@Param('tripId') tripId: string, @CurrentUser() user: JwtPayload) {
    return this.expensesService.getTripExpenseSummary(tripId, user.orgId);
  }

  /** Approve an expense */
  @Patch('expenses/:id/approve')
  @Roles('ADMIN', 'DISPATCHER')
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.expensesService.approve(id, user.orgId);
  }

  /** Reject an expense */
  @Patch('expenses/:id/reject')
  @Roles('ADMIN', 'DISPATCHER')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectExpenseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.expensesService.reject(id, dto, user.orgId);
  }
}
