import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { WhatsAppIntakeService } from './whatsapp-intake.service';

/**
 * WhatsApp Cloud API webhook payload types (simplified).
 */
interface WhatsAppWebhookBody {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: {
        messaging_product?: string;
        metadata?: { display_phone_number?: string; phone_number_id?: string };
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          text?: { body?: string };
          type?: string;
        }>;
      };
      field?: string;
    }>;
  }>;
}

@Controller()
export class WhatsAppIntakeController {
  private readonly logger = new Logger(WhatsAppIntakeController.name);

  constructor(
    private intakeService: WhatsAppIntakeService,
    private configService: ConfigService,
  ) {}

  /**
   * WhatsApp webhook verification (GET).
   * WhatsApp Cloud API sends a challenge that must be echoed back.
   * URL: GET /webhooks/whatsapp/:orgId
   */
  @Public()
  @Get('webhooks/whatsapp/:orgId')
  verifyWebhook(
    @Param('orgId') orgId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const expectedToken =
      (this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') as string) ||
      'tripbh-whatsapp-verify';

    if (mode === 'subscribe' && verifyToken === expectedToken) {
      this.logger.log(`Webhook verified for org ${orgId}`);
      return challenge;
    }

    this.logger.warn(`Webhook verification failed for org ${orgId}`);
    return 'Verification failed';
  }

  /**
   * WhatsApp webhook message handler (POST).
   * Receives incoming messages and processes the structured intake flow.
   * URL: POST /webhooks/whatsapp/:orgId
   */
  @Public()
  @Post('webhooks/whatsapp/:orgId')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('orgId') orgId: string,
    @Body() body: WhatsAppWebhookBody,
  ): Promise<{ status: string }> {
    // WhatsApp sends various webhook types; we only care about incoming text messages
    if (body.object !== 'whatsapp_business_account') {
      return { status: 'ignored' };
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        if (!value?.messages) continue;

        for (const message of value.messages) {
          if (message.type !== 'text' || !message.text?.body || !message.from) {
            continue;
          }

          const phone = message.from;
          const text = message.text.body;
          const customerName = value.contacts?.[0]?.profile?.name;

          this.logger.log(
            `Incoming message from ${phone} for org ${orgId}: "${text.substring(0, 50)}"`,
          );

          try {
            const reply = await this.intakeService.processMessage(
              orgId,
              phone,
              customerName,
              text,
            );

            // MVP: log the reply. In production, send via WhatsApp Cloud API.
            this.logger.log(
              `Reply to ${phone}: "${reply.substring(0, 80)}..."`,
            );
            await this.sendReply(phone, reply, value.metadata?.phone_number_id);
          } catch (err) {
            this.logger.error(`Error processing message from ${phone}:`, err);
          }
        }
      }
    }

    return { status: 'ok' };
  }

  /**
   * Admin endpoint to list recent WhatsApp conversations.
   */
  @Roles('ADMIN', 'DISPATCHER')
  @Get('whatsapp-intake/conversations')
  async listConversations(@CurrentUser() user: JwtPayload) {
    return this.intakeService.listConversations(user.orgId);
  }

  // ─── Private ──────────────────────────────────────────

  /**
   * Send a reply to the customer via WhatsApp Cloud API.
   * MVP: logs to console. Ready for production integration.
   */
  private async sendReply(
    to: string,
    text: string,
    phoneNumberId?: string,
  ): Promise<void> {
    const token = this.configService.get<string>(
      'WHATSAPP_ACCESS_TOKEN',
    ) as string;

    if (!token || !phoneNumberId) {
      // MVP fallback: just log
      console.log(`[WhatsApp Reply → ${to}]:\n${text}\n`);
      return;
    }

    // Production: call WhatsApp Cloud API
    try {
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!res.ok) {
        this.logger.warn(
          `WhatsApp API error: ${res.status} ${await res.text()}`,
        );
      }
    } catch (err) {
      this.logger.error('Failed to send WhatsApp reply:', err);
    }
  }
}
