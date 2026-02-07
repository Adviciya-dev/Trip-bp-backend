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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DriversService = class DriversService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, orgId) {
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '50', 10), 100);
        const skip = (page - 1) * limit;
        const where = {
            orgId,
            deletedAt: null,
        };
        if (query.status === 'active')
            where.isActive = true;
        if (query.status === 'inactive')
            where.isActive = false;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search } },
            ];
        }
        const [drivers, total] = await Promise.all([
            this.prisma.driver.findMany({
                where: where,
                include: {
                    vehicle: {
                        select: { id: true, plateNumber: true, vehicleType: true },
                    },
                },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.driver.count({ where: where }),
        ]);
        return {
            items: drivers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, orgId) {
        const driver = await this.prisma.driver.findFirst({
            where: { id, orgId, deletedAt: null },
            include: {
                vehicle: true,
                user: { select: { id: true, email: true, phone: true, role: true } },
            },
        });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        return driver;
    }
    async create(dto, orgId) {
        const existingPhone = await this.prisma.driver.findFirst({
            where: { orgId, phone: dto.phone, deletedAt: null },
        });
        if (existingPhone) {
            throw new common_1.ConflictException('A driver with this phone already exists');
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    orgId,
                    name: dto.name,
                    phone: dto.phone,
                    email: dto.email || null,
                    role: client_1.UserRole.DRIVER,
                    isActive: true,
                },
            });
            const driver = await tx.driver.create({
                data: {
                    orgId,
                    userId: user.id,
                    name: dto.name,
                    phone: dto.phone,
                    email: dto.email || null,
                    licenseNumber: dto.licenseNumber || null,
                    licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
                },
            });
            return this.prisma.driver.findFirst({
                where: { id: driver.id },
                include: {
                    vehicle: {
                        select: { id: true, plateNumber: true, vehicleType: true },
                    },
                },
            });
        });
    }
    async update(id, dto, orgId) {
        const existing = await this.findOne(id, orgId);
        if (dto.phone && dto.phone !== existing.phone) {
            const conflict = await this.prisma.driver.findFirst({
                where: { orgId, phone: dto.phone, deletedAt: null, id: { not: id } },
            });
            if (conflict) {
                throw new common_1.ConflictException('A driver with this phone already exists');
            }
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.phone !== undefined)
            data.phone = dto.phone;
        if (dto.email !== undefined)
            data.email = dto.email || null;
        if (dto.licenseNumber !== undefined)
            data.licenseNumber = dto.licenseNumber;
        if (dto.licenseExpiry !== undefined)
            data.licenseExpiry = dto.licenseExpiry
                ? new Date(dto.licenseExpiry)
                : null;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        return this.prisma.$transaction(async (tx) => {
            await tx.driver.update({
                where: { id },
                data: data,
            });
            const userData = {};
            if (dto.name !== undefined)
                userData.name = dto.name;
            if (dto.phone !== undefined)
                userData.phone = dto.phone;
            if (dto.email !== undefined)
                userData.email = dto.email || null;
            if (dto.isActive !== undefined)
                userData.isActive = dto.isActive;
            if (Object.keys(userData).length > 0) {
                await tx.user.update({
                    where: { id: existing.userId },
                    data: userData,
                });
            }
            return tx.driver.findFirst({
                where: { id },
                include: {
                    vehicle: {
                        select: { id: true, plateNumber: true, vehicleType: true },
                    },
                },
            });
        });
    }
    async softDelete(id, orgId) {
        await this.findOne(id, orgId);
        await this.prisma.driver.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { message: 'Driver deleted' };
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map