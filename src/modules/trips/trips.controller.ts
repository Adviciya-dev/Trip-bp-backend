import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryTripsDto } from './dto/query-trips.dto';
import { AssignTripDto } from './dto/assign-trip.dto';
import { DeclineTripDto } from './dto/decline-trip.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCHER')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Post()
  create(@Body() dto: CreateTripDto, @CurrentUser() user: JwtPayload) {
    return this.tripsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryTripsDto, @CurrentUser() user: JwtPayload) {
    return this.tripsService.findAll(query, user.orgId);
  }

  @Get('stats')
  getStats(@CurrentUser() user: JwtPayload) {
    return this.tripsService.getStats(user.orgId);
  }

  @Get('agency')
  @Roles('SUB_AGENCY_USER')
  async findAllForAgency(
    @Query() query: QueryTripsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const subAgencyId = await this.tripsService.resolveSubAgencyId(user.userId);
    return this.tripsService.findAllForSubAgency(
      query,
      user.orgId,
      subAgencyId,
    );
  }

  @Get('agency/stats')
  @Roles('SUB_AGENCY_USER')
  async getAgencyStats(@CurrentUser() user: JwtPayload) {
    const subAgencyId = await this.tripsService.resolveSubAgencyId(user.userId);
    return this.tripsService.getStatsForSubAgency(user.orgId, subAgencyId);
  }

  @Get('driver')
  @Roles('DRIVER')
  async findAllForDriver(
    @Query() query: QueryTripsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const driverId = await this.tripsService.resolveDriverId(user.userId);
    return this.tripsService.findAllForDriver(query, user.orgId, driverId);
  }

  @Get('driver/stats')
  @Roles('DRIVER')
  async getDriverStats(@CurrentUser() user: JwtPayload) {
    const driverId = await this.tripsService.resolveDriverId(user.userId);
    return this.tripsService.getStatsForDriver(user.orgId, driverId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'SUB_AGENCY_USER', 'DRIVER')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.findOne(id, user.orgId);
  }

  @Get(':id/timeline')
  @Roles('ADMIN', 'DISPATCHER', 'SUB_AGENCY_USER', 'DRIVER')
  getTimeline(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.getTimeline(id, user.orgId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'DISPATCHER', 'SUB_AGENCY_USER', 'DRIVER')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.updateStatus(id, dto, user);
  }

  @Post(':id/assign')
  assignTrip(
    @Param('id') id: string,
    @Body() dto: AssignTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.assignTrip(id, dto, user);
  }

  @Post(':id/accept')
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER')
  acceptAssignment(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.acceptAssignment(id, user);
  }

  @Post(':id/decline')
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER')
  declineAssignment(
    @Param('id') id: string,
    @Body() dto: DeclineTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.declineAssignment(id, dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTripDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tripsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tripsService.softDelete(id, user.orgId);
  }
}
