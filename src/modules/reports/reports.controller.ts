import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { Roles } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
@Roles('ADMIN', 'DISPATCHER')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('trips')
  getTripReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getTripReport(user.orgId, query);
  }

  @Get('revenue')
  getRevenueReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getRevenueReport(user.orgId, query);
  }

  @Get('commissions')
  getCommissionReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportsService.getCommissionReport(user.orgId, query);
  }

  @Get('export/:type')
  @Header('Content-Type', 'text/csv')
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Param('type') type: string,
    @Query() query: ReportQueryDto,
  ) {
    const { content } = await this.reportsService.exportCsv(
      user.orgId,
      type,
      query,
    );

    return new StreamableFile(Buffer.from(content, 'utf-8'));
  }
}
