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
import { SubAgenciesService } from './sub-agencies.service';
import { CreateSubAgencyDto } from './dto/create-sub-agency.dto';
import { UpdateSubAgencyDto } from './dto/update-sub-agency.dto';
import { QuerySubAgenciesDto } from './dto/query-sub-agencies.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('sub-agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubAgenciesController {
  constructor(private subAgenciesService: SubAgenciesService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER')
  findAll(
    @Query() query: QuerySubAgenciesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.subAgenciesService.findAll(query, user.orgId);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subAgenciesService.findOne(id, user.orgId);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateSubAgencyDto, @CurrentUser() user: JwtPayload) {
    return this.subAgenciesService.create(dto, user.orgId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubAgencyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.subAgenciesService.update(id, dto, user.orgId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subAgenciesService.softDelete(id, user.orgId);
  }
}
