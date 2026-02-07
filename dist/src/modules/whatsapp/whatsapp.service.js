"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WhatsAppService = class WhatsAppService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllTemplates(orgId) {
        return this.prisma.whatsAppTemplate.findMany({
            where: { orgId },
            orderBy: { name: 'asc' },
        });
    }
    async createTemplate(dto, orgId) {
        const existing = await this.prisma.whatsAppTemplate.findUnique({
            where: { orgId_name: { orgId, name: dto.name } },
        });
        if (existing) {
            throw new common_1.ConflictException('A template with this name already exists');
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
    async updateTemplate(id, dto, orgId) {
        const template = await this.prisma.whatsAppTemplate.findFirst({
            where: { id, orgId },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        if (dto.name && dto.name !== template.name) {
            const existing = await this.prisma.whatsAppTemplate.findUnique({
                where: { orgId_name: { orgId, name: dto.name } },
            });
            if (existing) {
                throw new common_1.ConflictException('A template with this name already exists');
            }
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.body !== undefined)
            data.body = dto.body;
        if (dto.variables !== undefined)
            data.variables = dto.variables;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        return this.prisma.whatsAppTemplate.update({
            where: { id },
            data: data,
        });
    }
    async sendWhatsApp(phone, templateName, variables, orgId) {
        const template = await this.prisma.whatsAppTemplate.findUnique({
            where: { orgId_name: { orgId, name: templateName } },
        });
        if (!template || !template.isActive) {
            console.log(`[WhatsApp] Template "${templateName}" not found or inactive for org ${orgId}. Skipping.`);
            return { sent: false, reason: 'template_not_found' };
        }
        let body = template.body;
        for (const [key, value] of Object.entries(variables)) {
            body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        console.log(`[WhatsApp] Sending to ${phone}:`);
        console.log(`[WhatsApp] Template: ${templateName}`);
        console.log(`[WhatsApp] Body: ${body}`);
        return { sent: true, phone, template: templateName, body };
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map