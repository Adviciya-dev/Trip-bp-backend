import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('whatsapp-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class WhatsAppController {
  constructor(private whatsappService: WhatsAppService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.whatsappService.findAllTemplates(user.orgId);
  }

  @Post()
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: JwtPayload) {
    return this.whatsappService.createTemplate(dto, user.orgId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.whatsappService.updateTemplate(id, dto, user.orgId);
  }
}
