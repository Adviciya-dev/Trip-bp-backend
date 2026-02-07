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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let VehiclesService = class VehiclesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(orgId) {
        return this.prisma.vehicle.findMany({
            where: { orgId },
            include: {
                driver: { select: { id: true, name: true, phone: true } },
            },
            orderBy: { plateNumber: 'asc' },
        });
    }
    async findOne(id, orgId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id, orgId },
            include: {
                driver: { select: { id: true, name: true, phone: true } },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        return vehicle;
    }
    async create(dto, orgId) {
        const existing = await this.prisma.vehicle.findFirst({
            where: { orgId, plateNumber: dto.plateNumber },
        });
        if (existing) {
            throw new common_1.ConflictException('A vehicle with this plate number already exists');
        }
        if (dto.driverId) {
            await this.validateDriverAssignment(dto.driverId, orgId);
        }
        return this.prisma.vehicle.create({
            data: {
                orgId,
                plateNumber: dto.plateNumber,
                vehicleType: dto.vehicleType,
                seats: dto.seats ?? 4,
                driverId: dto.driverId || null,
            },
            include: {
                driver: { select: { id: true, name: true, phone: true } },
            },
        });
    }
    async update(id, dto, orgId) {
        await this.findOne(id, orgId);
        if (dto.plateNumber) {
            const conflict = await this.prisma.vehicle.findFirst({
                where: { orgId, plateNumber: dto.plateNumber, id: { not: id } },
            });
            if (conflict) {
                throw new common_1.ConflictException('A vehicle with this plate number already exists');
            }
        }
        if (dto.driverId) {
            await this.validateDriverAssignment(dto.driverId, orgId, id);
        }
        const data = {};
        if (dto.plateNumber !== undefined)
            data.plateNumber = dto.plateNumber;
        if (dto.vehicleType !== undefined)
            data.vehicleType = dto.vehicleType;
        if (dto.seats !== undefined)
            data.seats = dto.seats;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        if (dto.driverId !== undefined)
            data.driverId = dto.driverId || null;
        return this.prisma.vehicle.update({
            where: { id },
            data: data,
            include: {
                driver: { select: { id: true, name: true, phone: true } },
            },
        });
    }
    async validateDriverAssignment(driverId, orgId, excludeVehicleId) {
        const driver = await this.prisma.driver.findFirst({
            where: { id: driverId, orgId, deletedAt: null },
        });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        const existingVehicle = await this.prisma.vehicle.findFirst({
            where: {
                driverId,
                ...(excludeVehicleId ? { id: { not: excludeVehicleId } } : {}),
            },
        });
        if (existingVehicle) {
            throw new common_1.ConflictException(`Driver is already assigned to vehicle ${existingVehicle.plateNumber}`);
        }
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map