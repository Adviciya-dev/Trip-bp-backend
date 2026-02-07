import { WhatsAppService } from './whatsapp.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class WhatsAppController {
    private whatsappService;
    constructor(whatsappService: WhatsAppService);
    findAll(user: JwtPayload): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        body: string;
        variables: string[];
    }[]>;
    create(dto: CreateTemplateDto, user: JwtPayload): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        body: string;
        variables: string[];
    }>;
    update(id: string, dto: UpdateTemplateDto, user: JwtPayload): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        body: string;
        variables: string[];
    }>;
}
