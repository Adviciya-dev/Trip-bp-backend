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
var WhatsAppIntakeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppIntakeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const STEPS = [
    {
        question: 'Welcome! What type of service do you need?\n\n1. Airport Transfer\n2. One Day\n3. Multi Day\n\nReply with the number or name.',
        field: 'serviceType',
    },
    { question: 'Where is the *pickup* location?', field: 'pickupAddress' },
    { question: 'Where is the *drop-off* location?', field: 'dropAddress' },
    {
        question: 'What *date and time*?\n(e.g. 15 Jan 2026, 10:30 AM)',
        field: 'scheduledAt',
    },
    { question: 'How many *passengers*?', field: 'paxCount' },
    {
        question: 'Any *special requests*?\n(Type "skip" if none)',
        field: 'notes',
    },
];
const SERVICE_TYPE_MAP = {
    '1': client_1.ServiceType.AIRPORT_TRANSFER,
    airport: client_1.ServiceType.AIRPORT_TRANSFER,
    'airport transfer': client_1.ServiceType.AIRPORT_TRANSFER,
    '2': client_1.ServiceType.ONE_DAY,
    'one day': client_1.ServiceType.ONE_DAY,
    oneday: client_1.ServiceType.ONE_DAY,
    '3': client_1.ServiceType.MULTI_DAY,
    'multi day': client_1.ServiceType.MULTI_DAY,
    multiday: client_1.ServiceType.MULTI_DAY,
};
const CONVERSATION_TTL_MS = 30 * 60 * 1000;
let WhatsAppIntakeService = WhatsAppIntakeService_1 = class WhatsAppIntakeService {
    prisma;
    logger = new common_1.Logger(WhatsAppIntakeService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processMessage(orgId, phone, customerName, text) {
        const trimmed = text.trim();
        if (['restart', 'start over', 'reset', 'hi', 'hello'].includes(trimmed.toLowerCase())) {
            return this.startNewConversation(orgId, phone, customerName);
        }
        const convo = await this.getActiveConversation(orgId, phone);
        if (!convo) {
            return this.startNewConversation(orgId, phone, customerName);
        }
        return this.processStep(convo, trimmed, customerName);
    }
    async getActiveConversation(orgId, phone) {
        const convo = await this.prisma.whatsAppConversation.findUnique({
            where: { orgId_phone: { orgId, phone } },
        });
        if (!convo || convo.isComplete)
            return null;
        if (convo.expiresAt < new Date()) {
            this.logger.log(`Conversation expired for ${phone} in org ${orgId}`);
            return null;
        }
        return convo;
    }
    async startNewConversation(orgId, phone, customerName) {
        const expiresAt = new Date(Date.now() + CONVERSATION_TTL_MS);
        await this.prisma.whatsAppConversation.upsert({
            where: { orgId_phone: { orgId, phone } },
            create: {
                orgId,
                phone,
                customerName: customerName || null,
                step: 0,
                data: {},
                isComplete: false,
                expiresAt,
            },
            update: {
                step: 0,
                data: {},
                isComplete: false,
                tripId: null,
                customerName: customerName || undefined,
                expiresAt,
            },
        });
        return STEPS[0].question;
    }
    async processStep(convo, answer, customerName) {
        const currentStep = convo.step;
        const data = (convo.data || {});
        const parsed = this.parseAnswer(currentStep, answer);
        if (parsed.error) {
            return parsed.error;
        }
        const field = STEPS[currentStep].field;
        data[field] = parsed.value;
        const nextStep = currentStep + 1;
        const expiresAt = new Date(Date.now() + CONVERSATION_TTL_MS);
        if (nextStep >= STEPS.length) {
            const trip = await this.createDraftTrip(convo.orgId, convo.phone, customerName || convo.customerName || 'WhatsApp Customer', data);
            await this.prisma.whatsAppConversation.update({
                where: { id: convo.id },
                data: {
                    step: nextStep,
                    data: data,
                    isComplete: true,
                    tripId: trip.id,
                    expiresAt,
                },
            });
            return (`Your trip has been created!\n\n` +
                `Reference: *${trip.tripNumber}*\n` +
                `Type: ${data.serviceType}\n` +
                `From: ${data.pickupAddress}\n` +
                `To: ${data.dropAddress}\n` +
                `Date: ${data.scheduledAt}\n` +
                `Passengers: ${data.paxCount}\n\n` +
                `Our team will confirm your booking shortly. Thank you!`);
        }
        await this.prisma.whatsAppConversation.update({
            where: { id: convo.id },
            data: {
                step: nextStep,
                data: data,
                expiresAt,
            },
        });
        return STEPS[nextStep].question;
    }
    parseAnswer(step, answer) {
        const field = STEPS[step].field;
        switch (field) {
            case 'serviceType': {
                const key = answer.toLowerCase().trim();
                const mapped = SERVICE_TYPE_MAP[key];
                if (!mapped) {
                    return {
                        error: 'Please reply with a valid option:\n1. Airport Transfer\n2. One Day\n3. Multi Day',
                    };
                }
                return { value: mapped };
            }
            case 'scheduledAt': {
                const date = new Date(answer);
                if (isNaN(date.getTime())) {
                    return {
                        error: "I couldn't understand that date. Please try again.\nExample: 15 Jan 2026, 10:30 AM",
                    };
                }
                if (date < new Date()) {
                    return {
                        error: 'That date is in the past. Please enter a future date and time.',
                    };
                }
                return { value: date.toISOString() };
            }
            case 'paxCount': {
                const num = parseInt(answer, 10);
                if (isNaN(num) || num < 1 || num > 50) {
                    return { error: 'Please enter a valid number of passengers (1-50).' };
                }
                return { value: num };
            }
            case 'notes': {
                const lower = answer.toLowerCase().trim();
                if (lower === 'skip' || lower === 'none' || lower === 'no') {
                    return { value: null };
                }
                return { value: answer };
            }
            default:
                if (!answer.trim()) {
                    return { error: 'Please enter a valid location.' };
                }
                return { value: answer.trim() };
        }
    }
    async createDraftTrip(orgId, phone, customerName, data) {
        const tripNumber = await this.generateTripNumber(orgId);
        return this.prisma.trip.create({
            data: {
                orgId,
                tripNumber,
                status: client_1.TripStatus.DRAFT,
                source: client_1.TripSource.WHATSAPP_INTAKE,
                serviceType: data.serviceType,
                customerName,
                customerPhone: phone,
                pickupAddress: data.pickupAddress || '',
                dropAddress: data.dropAddress || '',
                scheduledAt: new Date(data.scheduledAt || Date.now()),
                paxCount: data.paxCount || 1,
                notes: data.notes || null,
            },
        });
    }
    async generateTripNumber(orgId) {
        const today = new Date();
        const dateStr = String(today.getFullYear()).slice(2) +
            String(today.getMonth() + 1).padStart(2, '0') +
            String(today.getDate()).padStart(2, '0');
        const count = await this.prisma.trip.count({
            where: {
                orgId,
                createdAt: {
                    gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                },
            },
        });
        return `TRP-${dateStr}-${String(count + 1).padStart(3, '0')}`;
    }
    async listConversations(orgId, limit = 50) {
        return this.prisma.whatsAppConversation.findMany({
            where: { orgId },
            orderBy: { updatedAt: 'desc' },
            take: limit,
        });
    }
};
exports.WhatsAppIntakeService = WhatsAppIntakeService;
exports.WhatsAppIntakeService = WhatsAppIntakeService = WhatsAppIntakeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsAppIntakeService);
//# sourceMappingURL=whatsapp-intake.service.js.map