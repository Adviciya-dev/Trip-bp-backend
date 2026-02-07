import { PrismaService } from '../../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    getMessages(tripId: string, orgId: string): Promise<({
        sender: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        tripId: string;
        senderId: string;
        message: string;
        isSystem: boolean;
    })[]>;
    sendMessage(tripId: string, senderId: string, message: string, orgId: string): Promise<{
        sender: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        tripId: string;
        senderId: string;
        message: string;
        isSystem: boolean;
    }>;
    createSystemMessage(tripId: string, actorId: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        tripId: string;
        senderId: string;
        message: string;
        isSystem: boolean;
    }>;
    getMessageCount(tripId: string): Promise<number>;
    private verifyTrip;
}
