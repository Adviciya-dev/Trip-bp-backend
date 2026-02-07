import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getMessages(tripId: string, user: JwtPayload): Promise<({
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
    sendMessage(tripId: string, dto: SendMessageDto, user: JwtPayload): Promise<{
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
    getMessageCount(tripId: string): Promise<number>;
}
