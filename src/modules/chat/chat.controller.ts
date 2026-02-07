import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCHER', 'DRIVER', 'SUB_AGENCY_USER')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':tripId/chat')
  getMessages(
    @Param('tripId') tripId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.getMessages(tripId, user.orgId);
  }

  @Post(':tripId/chat')
  sendMessage(
    @Param('tripId') tripId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.sendMessage(
      tripId,
      user.userId,
      dto.message,
      user.orgId,
    );
  }

  @Get(':tripId/chat/count')
  getMessageCount(@Param('tripId') tripId: string) {
    return this.chatService.getMessageCount(tripId);
  }
}
