import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { CalculateFareDto } from './dto/calculate-fare.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.pricingService.findAll(user.orgId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.pricingService.findOne(id, user.orgId);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreatePricingRuleDto, @CurrentUser() user: JwtPayload) {
    return this.pricingService.create(dto, user.orgId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePricingRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pricingService.update(id, dto, user.orgId);
  }

  @Post('calculate')
  @Roles('ADMIN', 'DISPATCHER')
  calculateFare(
    @Body() dto: CalculateFareDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pricingService.calculateFare(dto, user.orgId);
  }
}
