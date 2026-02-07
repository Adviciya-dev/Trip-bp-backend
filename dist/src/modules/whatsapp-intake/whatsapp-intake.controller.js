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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsAppIntakeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppIntakeController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const whatsapp_intake_service_1 = require("./whatsapp-intake.service");
let WhatsAppIntakeController = WhatsAppIntakeController_1 = class WhatsAppIntakeController {
    intakeService;
    configService;
    logger = new common_1.Logger(WhatsAppIntakeController_1.name);
    constructor(intakeService, configService) {
        this.intakeService = intakeService;
        this.configService = configService;
    }
    verifyWebhook(orgId, mode, verifyToken, challenge) {
        const expectedToken = this.configService.get('WHATSAPP_VERIFY_TOKEN') ||
            'tripbh-whatsapp-verify';
        if (mode === 'subscribe' && verifyToken === expectedToken) {
            this.logger.log(`Webhook verified for org ${orgId}`);
            return challenge;
        }
        this.logger.warn(`Webhook verification failed for org ${orgId}`);
        return 'Verification failed';
    }
    async handleWebhook(orgId, body) {
        if (body.object !== 'whatsapp_business_account') {
            return { status: 'ignored' };
        }
        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                if (change.field !== 'messages')
                    continue;
                const value = change.value;
                if (!value?.messages)
                    continue;
                for (const message of value.messages) {
                    if (message.type !== 'text' || !message.text?.body || !message.from) {
                        continue;
                    }
                    const phone = message.from;
                    const text = message.text.body;
                    const customerName = value.contacts?.[0]?.profile?.name;
                    this.logger.log(`Incoming message from ${phone} for org ${orgId}: "${text.substring(0, 50)}"`);
                    try {
                        const reply = await this.intakeService.processMessage(orgId, phone, customerName, text);
                        this.logger.log(`Reply to ${phone}: "${reply.substring(0, 80)}..."`);
                        await this.sendReply(phone, reply, value.metadata?.phone_number_id);
                    }
                    catch (err) {
                        this.logger.error(`Error processing message from ${phone}:`, err);
                    }
                }
            }
        }
        return { status: 'ok' };
    }
    async listConversations(user) {
        return this.intakeService.listConversations(user.orgId);
    }
    async sendReply(to, text, phoneNumberId) {
        const token = this.configService.get('WHATSAPP_ACCESS_TOKEN');
        if (!token || !phoneNumberId) {
            console.log(`[WhatsApp Reply → ${to}]:\n${text}\n`);
            return;
        }
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
                this.logger.warn(`WhatsApp API error: ${res.status} ${await res.text()}`);
            }
        }
        catch (err) {
            this.logger.error('Failed to send WhatsApp reply:', err);
        }
    }
};
exports.WhatsAppIntakeController = WhatsAppIntakeController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('webhooks/whatsapp/:orgId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Query)('hub.mode')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __param(3, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", String)
], WhatsAppIntakeController.prototype, "verifyWebhook", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhooks/whatsapp/:orgId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WhatsAppIntakeController.prototype, "handleWebhook", null);
__decorate([
    (0, roles_decorator_1.Roles)('ADMIN', 'DISPATCHER'),
    (0, common_1.Get)('whatsapp-intake/conversations'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsAppIntakeController.prototype, "listConversations", null);
exports.WhatsAppIntakeController = WhatsAppIntakeController = WhatsAppIntakeController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [whatsapp_intake_service_1.WhatsAppIntakeService,
        config_1.ConfigService])
], WhatsAppIntakeController);
//# sourceMappingURL=whatsapp-intake.controller.js.map