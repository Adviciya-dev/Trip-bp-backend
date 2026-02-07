import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { WhatsAppIntakeService } from './whatsapp-intake.service';
interface WhatsAppWebhookBody {
    object?: string;
    entry?: Array<{
        id?: string;
        changes?: Array<{
            value?: {
                messaging_product?: string;
                metadata?: {
                    display_phone_number?: string;
                    phone_number_id?: string;
                };
                contacts?: Array<{
                    profile?: {
                        name?: string;
                    };
                    wa_id?: string;
                }>;
                messages?: Array<{
                    from?: string;
                    id?: string;
                    timestamp?: string;
                    text?: {
                        body?: string;
                    };
                    type?: string;
                }>;
            };
            field?: string;
        }>;
    }>;
}
export declare class WhatsAppIntakeController {
    private intakeService;
    private configService;
    private readonly logger;
    constructor(intakeService: WhatsAppIntakeService, configService: ConfigService);
    verifyWebhook(orgId: string, mode: string, verifyToken: string, challenge: string): string;
    handleWebhook(orgId: string, body: WhatsAppWebhookBody): Promise<{
        status: string;
    }>;
    listConversations(user: JwtPayload): Promise<{
        id: string;
        orgId: string;
        phone: string;
        customerName: string | null;
        step: number;
        data: import("@prisma/client/runtime/library").JsonValue;
        isComplete: boolean;
        tripId: string | null;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    private sendReply;
}
export {};
