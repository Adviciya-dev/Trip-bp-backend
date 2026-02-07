import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /** Get all messages for a trip */
  async getMessages(tripId: string, orgId: string) {
    await this.verifyTrip(tripId, orgId);

    return this.prisma.tripChat.findMany({
      where: { tripId },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Send a user message */
  async sendMessage(
    tripId: string,
    senderId: string,
    message: string,
    orgId: string,
  ) {
    await this.verifyTrip(tripId, orgId);

    return this.prisma.tripChat.create({
      data: {
        tripId,
        senderId,
        message,
        isSystem: false,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });
  }

  /** Create a system message (no auth needed — called internally) */
  async createSystemMessage(tripId: string, actorId: string, message: string) {
    return this.prisma.tripChat.create({
      data: {
        tripId,
        senderId: actorId,
        message,
        isSystem: true,
      },
    });
  }

  /** Get unread count (messages after a given timestamp) */
  async getMessageCount(tripId: string) {
    return this.prisma.tripChat.count({
      where: { tripId },
    });
  }

  private async verifyTrip(tripId: string, orgId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, orgId },
      select: { id: true },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }
}
