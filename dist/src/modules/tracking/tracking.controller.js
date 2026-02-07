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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../../common/decorators");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TrackingController = class TrackingController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByToken(token) {
        const trip = await this.prisma.trip.findUnique({
            where: { trackingToken: token },
            include: {
                org: { select: { name: true, logo: true } },
                assignment: {
                    include: {
                        driver: { select: { name: true, phone: true } },
                    },
                },
                statusLogs: {
                    select: {
                        toStatus: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Tracking link not found or has expired');
        }
        const terminalStatuses = [
            client_1.TripStatus.COMPLETED,
            client_1.TripStatus.CANCELLED,
            client_1.TripStatus.NO_SHOW,
        ];
        if (terminalStatuses.includes(trip.status)) {
            const lastLog = trip.statusLogs[trip.statusLogs.length - 1];
            if (lastLog) {
                const completedAt = new Date(lastLog.createdAt);
                const expiresAt = new Date(completedAt.getTime() + 48 * 60 * 60 * 1000);
                if (new Date() > expiresAt) {
                    return {
                        expired: true,
                        status: trip.status,
                        message: 'This tracking link has expired. The trip has been completed.',
                    };
                }
            }
        }
        const isAssigned = trip.status !== client_1.TripStatus.DRAFT &&
            trip.status !== client_1.TripStatus.CONFIRMED &&
            trip.status !== client_1.TripStatus.READY_FOR_ASSIGNMENT;
        return {
            expired: false,
            orgName: trip.org.name,
            orgLogo: trip.org.logo,
            tripNumber: trip.tripNumber,
            status: trip.status,
            serviceType: trip.serviceType,
            scheduledAt: trip.scheduledAt,
            scheduledEndAt: trip.scheduledEndAt,
            pickupAddress: trip.pickupAddress,
            dropAddress: trip.dropAddress,
            paxCount: trip.paxCount,
            driver: isAssigned && trip.assignment?.driver
                ? {
                    name: trip.assignment.driver.name,
                    phone: trip.assignment.driver.phone,
                }
                : null,
            timeline: trip.statusLogs.map((log) => ({
                status: log.toStatus,
                at: log.createdAt,
            })),
        };
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)(':token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getByToken", null);
exports.TrackingController = TrackingController = __decorate([
    (0, common_1.Controller)('tracking'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map