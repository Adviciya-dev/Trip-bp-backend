import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ServiceType, TripSource, TripStatus } from '@prisma/client';

/** Conversation step definitions */
const STEPS = [
  {
    question:
      'Welcome! What type of service do you need?\n\n1. Airport Transfer\n2. One Day\n3. Multi Day\n\nReply with the number or name.',
    field: 'serviceType',
  },
  { question: 'Where is the *pickup* location?', field: 'pickupAddress' },
  { question: 'Where is the *drop-off* location?', field: 'dropAddress' },
  {
    question: 'What *date and time*?\n(e.g. 15 Jan 2026, 10:30 AM)',
    field: 'scheduledAt',
  },
  { question: 'How many *passengers*?', field: 'paxCount' },
  {
    question: 'Any *special requests*?\n(Type "skip" if none)',
    field: 'notes',
  },
] as const;

const SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  '1': ServiceType.AIRPORT_TRANSFER,
  airport: ServiceType.AIRPORT_TRANSFER,
  'airport transfer': ServiceType.AIRPORT_TRANSFER,
  '2': ServiceType.ONE_DAY,
  'one day': ServiceType.ONE_DAY,
  oneday: ServiceType.ONE_DAY,
  '3': ServiceType.MULTI_DAY,
  'multi day': ServiceType.MULTI_DAY,
  multiday: ServiceType.MULTI_DAY,
};

const CONVERSATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface ConversationData {
  serviceType?: string;
  pickupAddress?: string;
  dropAddress?: string;
  scheduledAt?: string;
  paxCount?: number;
  notes?: string;
}

@Injectable()
export class WhatsAppIntakeService {
  private readonly logger = new Logger(WhatsAppIntakeService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Main entry: process an incoming message for an org + phone.
   * Returns the reply text to send back.
   */
  async processMessage(
    orgId: string,
    phone: string,
    customerName: string | undefined,
    text: string,
  ): Promise<string> {
    const trimmed = text.trim();

    // Handle restart keywords
    if (
      ['restart', 'start over', 'reset', 'hi', 'hello'].includes(
        trimmed.toLowerCase(),
      )
    ) {
      return this.startNewConversation(orgId, phone, customerName);
    }

    // Find or create conversation
    const convo = await this.getActiveConversation(orgId, phone);

    if (!convo) {
      return this.startNewConversation(orgId, phone, customerName);
    }

    // Process the answer for the current step
    return this.processStep(convo, trimmed, customerName);
  }

  // ─── Private helpers ──────────────────────────────────

  private async getActiveConversation(orgId: string, phone: string) {
    const convo = await this.prisma.whatsAppConversation.findUnique({
      where: { orgId_phone: { orgId, phone } },
    });

    if (!convo || convo.isComplete) return null;

    // Check expiry
    if (convo.expiresAt < new Date()) {
      this.logger.log(`Conversation expired for ${phone} in org ${orgId}`);
      return null;
    }

    return convo;
  }

  private async startNewConversation(
    orgId: string,
    phone: string,
    customerName: string | undefined,
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + CONVERSATION_TTL_MS);

    await this.prisma.whatsAppConversation.upsert({
      where: { orgId_phone: { orgId, phone } },
      create: {
        orgId,
        phone,
        customerName: customerName || null,
        step: 0,
        data: {},
        isComplete: false,
        expiresAt,
      },
      update: {
        step: 0,
        data: {},
        isComplete: false,
        tripId: null,
        customerName: customerName || undefined,
        expiresAt,
      },
    });

    return STEPS[0].question;
  }

  private async processStep(
    convo: {
      id: string;
      orgId: string;
      phone: string;
      step: number;
      data: unknown;
      customerName: string | null;
    },
    answer: string,
    customerName: string | undefined,
  ): Promise<string> {
    const currentStep = convo.step;
    const data = (convo.data || {}) as ConversationData;

    // Validate & parse the answer
    const parsed = this.parseAnswer(currentStep, answer);
    if (parsed.error) {
      return parsed.error;
    }

    // Store the answer
    const field = STEPS[currentStep].field;
    (data as Record<string, unknown>)[field] = parsed.value;

    const nextStep = currentStep + 1;
    const expiresAt = new Date(Date.now() + CONVERSATION_TTL_MS);

    if (nextStep >= STEPS.length) {
      // All steps complete — create trip
      const trip = await this.createDraftTrip(
        convo.orgId,
        convo.phone,
        customerName || convo.customerName || 'WhatsApp Customer',
        data,
      );

      await this.prisma.whatsAppConversation.update({
        where: { id: convo.id },
        data: {
          step: nextStep,
          data: data as never,
          isComplete: true,
          tripId: trip.id,
          expiresAt,
        },
      });

      return (
        `Your trip has been created!\n\n` +
        `Reference: *${trip.tripNumber}*\n` +
        `Type: ${data.serviceType}\n` +
        `From: ${data.pickupAddress}\n` +
        `To: ${data.dropAddress}\n` +
        `Date: ${data.scheduledAt}\n` +
        `Passengers: ${data.paxCount}\n\n` +
        `Our team will confirm your booking shortly. Thank you!`
      );
    }

    // Move to next step
    await this.prisma.whatsAppConversation.update({
      where: { id: convo.id },
      data: {
        step: nextStep,
        data: data as never,
        expiresAt,
      },
    });

    return STEPS[nextStep].question;
  }

  private parseAnswer(
    step: number,
    answer: string,
  ): { value?: unknown; error?: string } {
    const field = STEPS[step].field;

    switch (field) {
      case 'serviceType': {
        const key = answer.toLowerCase().trim();
        const mapped = SERVICE_TYPE_MAP[key];
        if (!mapped) {
          return {
            error:
              'Please reply with a valid option:\n1. Airport Transfer\n2. One Day\n3. Multi Day',
          };
        }
        return { value: mapped };
      }

      case 'scheduledAt': {
        const date = new Date(answer);
        if (isNaN(date.getTime())) {
          return {
            error:
              "I couldn't understand that date. Please try again.\nExample: 15 Jan 2026, 10:30 AM",
          };
        }
        if (date < new Date()) {
          return {
            error:
              'That date is in the past. Please enter a future date and time.',
          };
        }
        return { value: date.toISOString() };
      }

      case 'paxCount': {
        const num = parseInt(answer, 10);
        if (isNaN(num) || num < 1 || num > 50) {
          return { error: 'Please enter a valid number of passengers (1-50).' };
        }
        return { value: num };
      }

      case 'notes': {
        const lower = answer.toLowerCase().trim();
        if (lower === 'skip' || lower === 'none' || lower === 'no') {
          return { value: null };
        }
        return { value: answer };
      }

      default:
        // pickupAddress, dropAddress — accept as-is
        if (!answer.trim()) {
          return { error: 'Please enter a valid location.' };
        }
        return { value: answer.trim() };
    }
  }

  private async createDraftTrip(
    orgId: string,
    phone: string,
    customerName: string,
    data: ConversationData,
  ) {
    const tripNumber = await this.generateTripNumber(orgId);

    return this.prisma.trip.create({
      data: {
        orgId,
        tripNumber,
        status: TripStatus.DRAFT,
        source: TripSource.WHATSAPP_INTAKE,
        serviceType: data.serviceType as ServiceType,
        customerName,
        customerPhone: phone,
        pickupAddress: data.pickupAddress || '',
        dropAddress: data.dropAddress || '',
        scheduledAt: new Date(data.scheduledAt || Date.now()),
        paxCount: data.paxCount || 1,
        notes: data.notes || null,
      },
    });
  }

  private async generateTripNumber(orgId: string): Promise<string> {
    const today = new Date();
    const dateStr =
      String(today.getFullYear()).slice(2) +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const count = await this.prisma.trip.count({
      where: {
        orgId,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });

    return `TRP-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * List recent WhatsApp conversations for an org (for admin view).
   */
  async listConversations(orgId: string, limit = 50) {
    return this.prisma.whatsAppConversation.findMany({
      where: { orgId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }
}
