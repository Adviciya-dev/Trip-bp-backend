import { PrismaService } from '../../prisma/prisma.service';
export declare class WhatsAppIntakeService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processMessage(orgId: string, phone: string, customerName: string | undefined, text: string): Promise<string>;
    private getActiveConversation;
    private startNewConversation;
    private processStep;
    private parseAnswer;
    private createDraftTrip;
    private generateTripNumber;
    listConversations(orgId: string, limit?: number): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        orgId: string;
        customerName: string | null;
        tripId: string | null;
        step: number;
        isComplete: boolean;
        expiresAt: Date;
    }[]>;
}
