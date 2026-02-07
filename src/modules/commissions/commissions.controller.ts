import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  // ─── RULES (Admin only) ───────────────────────────────

  @Get('rules')
  @Roles('ADMIN')
  findAllRules(
    @Query('subAgencyId') subAgencyId: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commissionsService.findAllRules(user.orgId, subAgencyId);
  }

  @Post('rules')
  @Roles('ADMIN')
  createRule(
    @Body() dto: CreateCommissionRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commissionsService.createRule(dto, user.orgId);
  }

  @Patch('rules/:id')
  @Roles('ADMIN')
  updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commissionsService.updateRule(id, dto, user.orgId);
  }

  // ─── LEDGER (Ops view) ───────────────────────────────

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  findAllLedger(
    @Query() query: QueryCommissionsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commissionsService.findAllLedger(query, user.orgId);
  }

  @Get('stats')
  @Roles('ADMIN', 'DISPATCHER')
  getLedgerStats(@CurrentUser() user: JwtPayload) {
    return this.commissionsService.getLedgerStats(user.orgId);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.commissionsService.approveCommission(id, user.orgId);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  reject(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.commissionsService.rejectCommission(id, user.orgId);
  }

  @Post('bulk-approve')
  @Roles('ADMIN')
  bulkApprove(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commissionsService.bulkApprove(body.ids, user.orgId);
  }

  // ─── LEDGER (Sub-Agency view) ────────────────────────

  @Get('agency')
  @Roles('SUB_AGENCY_USER')
  async findAgencyLedger(
    @Query() query: QueryCommissionsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const subAgencyId = await this.commissionsService.resolveSubAgencyId(
      user.userId,
    );
    return this.commissionsService.findLedgerForSubAgency(
      query,
      user.orgId,
      subAgencyId,
    );
  }

  @Get('agency/stats')
  @Roles('SUB_AGENCY_USER')
  async getAgencyLedgerStats(@CurrentUser() user: JwtPayload) {
    const subAgencyId = await this.commissionsService.resolveSubAgencyId(
      user.userId,
    );
    return this.commissionsService.getLedgerStats(user.orgId, subAgencyId);
  }
}
