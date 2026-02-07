import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { Roles } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { UpdateOrgDto } from './dto/update-org.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertServiceTypeDto } from './dto/upsert-service-type.dto';

@Controller('settings')
@Roles('ADMIN')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // --- Organization ---

  @Get('org')
  getOrg(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getOrg(user.orgId);
  }

  @Patch('org')
  updateOrg(@CurrentUser() user: JwtPayload, @Body() dto: UpdateOrgDto) {
    return this.settingsService.updateOrg(user.orgId, dto);
  }

  // --- Users ---

  @Get('users')
  listUsers(@CurrentUser() user: JwtPayload) {
    return this.settingsService.listUsers(user.orgId);
  }

  @Post('users')
  createUser(@CurrentUser() user: JwtPayload, @Body() dto: CreateUserDto) {
    return this.settingsService.createUser(user.orgId, dto);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.settingsService.updateUser(user.orgId, userId, dto);
  }

  // --- Service Types ---

  @Get('service-types')
  listServiceTypes(@CurrentUser() user: JwtPayload) {
    return this.settingsService.listServiceTypes(user.orgId);
  }

  @Post('service-types')
  upsertServiceType(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpsertServiceTypeDto,
  ) {
    return this.settingsService.upsertServiceType(user.orgId, dto);
  }
}
