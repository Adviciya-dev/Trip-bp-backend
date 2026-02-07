import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class WhatsAppService {
  constructor(private prisma: PrismaService) {}

  // ─── Template CRUD ────────────────────────────────────

  async findAllTemplates(orgId: string) {
    return this.prisma.whatsAppTemplate.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
    });
  }

  async createTemplate(dto: CreateTemplateDto, orgId: string) {
    // Check for name uniqueness within org
    const existing = await this.prisma.whatsAppTemplate.findUnique({
      where: { orgId_name: { orgId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('A template with this name already exists');
    }

    return this.prisma.whatsAppTemplate.create({
      data: {
        orgId,
        name: dto.name,
        body: dto.body,
        variables: dto.variables || [],
      },
    });
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto, orgId: string) {
    const template = await this.prisma.whatsAppTemplate.findFirst({
      where: { id, orgId },
    });
    if (!template) throw new NotFoundException('Template not found');

    // Check name uniqueness if changing name
    if (dto.name && dto.name !== template.name) {
      const existing = await this.prisma.whatsAppTemplate.findUnique({
        where: { orgId_name: { orgId, name: dto.name } },
      });
      if (existing) {
        throw new ConflictException('A template with this name already exists');
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.body !== undefined) data.body = dto.body;
    if (dto.variables !== undefined) data.variables = dto.variables;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.whatsAppTemplate.update({
      where: { id },
      data: data as never,
    });
  }

  // ─── Sending stub ─────────────────────────────────────

  /**
   * Stub: Send WhatsApp message via template.
   * MVP: logs to console. Ready for Twilio/WATI integration.
   */
  async sendWhatsApp(
    phone: string,
    templateName: string,
    variables: Record<string, string>,
    orgId: string,
  ) {
    const template = await this.prisma.whatsAppTemplate.findUnique({
      where: { orgId_name: { orgId, name: templateName } },
    });

    if (!template || !template.isActive) {
      console.log(
        `[WhatsApp] Template "${templateName}" not found or inactive for org ${orgId}. Skipping.`,
      );
      return { sent: false, reason: 'template_not_found' };
    }

    // Replace variables in body
    let body = template.body;
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // MVP: Just log it
    console.log(`[WhatsApp] Sending to ${phone}:`);
    console.log(`[WhatsApp] Template: ${templateName}`);
    console.log(`[WhatsApp] Body: ${body}`);

    return { sent: true, phone, template: templateName, body };
  }
}
