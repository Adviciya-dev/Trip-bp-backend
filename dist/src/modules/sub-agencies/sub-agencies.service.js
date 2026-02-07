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
exports.SubAgenciesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SubAgenciesService = class SubAgenciesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, orgId) {
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
                { contactPerson: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search } },
            ];
        }
        return this.prisma.subAgency.findMany({
            where: where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id, orgId) {
        const agency = await this.prisma.subAgency.findFirst({
            where: { id, orgId, deletedAt: null },
            include: {
                users: { select: { id: true, name: true, email: true, phone: true } },
            },
        });
        if (!agency) {
            throw new common_1.NotFoundException('Sub-agency not found');
        }
        return agency;
    }
    async create(dto, orgId) {
        const existing = await this.prisma.subAgency.findFirst({
            where: { orgId, name: dto.name, deletedAt: null },
        });
        if (existing) {
            throw new common_1.ConflictException('A sub-agency with this name already exists');
        }
        return this.prisma.$transaction(async (tx) => {
            const agency = await tx.subAgency.create({
                data: {
                    orgId,
                    name: dto.name,
                    contactPerson: dto.contactPerson || null,
                    phone: dto.phone || null,
                    email: dto.email || null,
                    address: dto.address || null,
                    servicesAllowed: dto.servicesAllowed || [],
                    settlementCycle: dto.settlementCycle || 'MONTHLY',
                },
            });
            if (dto.email || dto.phone) {
                await tx.user.create({
                    data: {
                        orgId,
                        name: dto.contactPerson || dto.name,
                        email: dto.email || null,
                        phone: dto.phone || null,
                        role: client_1.UserRole.SUB_AGENCY_USER,
                        isActive: true,
                        subAgencyId: agency.id,
                    },
                });
            }
            return agency;
        });
    }
    async update(id, dto, orgId) {
        await this.findOne(id, orgId);
        if (dto.name) {
            const conflict = await this.prisma.subAgency.findFirst({
                where: { orgId, name: dto.name, deletedAt: null, id: { not: id } },
            });
            if (conflict) {
                throw new common_1.ConflictException('A sub-agency with this name already exists');
            }
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.contactPerson !== undefined)
            data.contactPerson = dto.contactPerson || null;
        if (dto.phone !== undefined)
            data.phone = dto.phone || null;
        if (dto.email !== undefined)
            data.email = dto.email || null;
        if (dto.address !== undefined)
            data.address = dto.address || null;
        if (dto.servicesAllowed !== undefined)
            data.servicesAllowed = dto.servicesAllowed;
        if (dto.settlementCycle !== undefined)
            data.settlementCycle = dto.settlementCycle;
        if (dto.isActive !== undefined)
            data.isActive = dto.isActive;
        return this.prisma.subAgency.update({
            where: { id },
            data: data,
        });
    }
    async softDelete(id, orgId) {
        await this.findOne(id, orgId);
        await this.prisma.subAgency.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
        return { message: 'Sub-agency deleted' };
    }
};
exports.SubAgenciesService = SubAgenciesService;
exports.SubAgenciesService = SubAgenciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubAgenciesService);
//# sourceMappingURL=sub-agencies.service.js.map