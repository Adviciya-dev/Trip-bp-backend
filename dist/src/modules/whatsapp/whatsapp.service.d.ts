import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
export declare class WhatsAppService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllTemplates(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        body: string;
        variables: string[];
    }[]>;
    createTemplate(dto: CreateTemplateDto, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        body: string;
        variables: string[];
    }>;
    updateTemplate(id: string, dto: UpdateTemplateDto, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        body: string;
        variables: string[];
    }>;
    sendWhatsApp(phone: string, templateName: string, variables: Record<string, string>, orgId: string): Promise<{
        sent: boolean;
        reason: string;
        phone?: undefined;
        template?: undefined;
        body?: undefined;
    } | {
        sent: boolean;
        phone: string;
        template: string;
        body: string;
        reason?: undefined;
    }>;
}
