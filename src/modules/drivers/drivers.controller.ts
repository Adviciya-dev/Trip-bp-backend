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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  findAll(@Query() query: QueryDriversDto, @CurrentUser() user: JwtPayload) {
    return this.driversService.findAll(query, user.orgId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.driversService.findOne(id, user.orgId);
  }

  @Post()
  create(@Body() dto: CreateDriverDto, @CurrentUser() user: JwtPayload) {
    return this.driversService.create(dto, user.orgId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.driversService.update(id, dto, user.orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.driversService.softDelete(id, user.orgId);
  }
}
