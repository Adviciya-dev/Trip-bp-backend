import { Controller, Get } from '@nestjs/common';
import { Roles } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@Roles('ADMIN', 'DISPATCHER')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getStats(user.orgId);
  }

  @Get('activity')
  getActivity(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getActivity(user.orgId);
  }

  @Get('revenue')
  getRevenue(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getRevenue(user.orgId);
  }

  @Get('today-trips')
  getTodayTrips(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getTodayTrips(user.orgId);
  }
}
