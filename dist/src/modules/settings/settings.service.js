"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrg(orgId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });
        if (!org)
            throw new common_1.NotFoundException('Organization not found');
        return org;
    }
    async updateOrg(orgId, dto) {
        return this.prisma.organization.update({
            where: { id: orgId },
            data: dto,
        });
    }
    async listUsers(orgId) {
        return this.prisma.user.findMany({
            where: { orgId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createUser(orgId, dto) {
        if (!dto.email && !dto.phone) {
            throw new common_1.BadRequestException('Email or phone is required');
        }
        if (dto.email) {
            const existing = await this.prisma.user.findUnique({
                where: { orgId_email: { orgId, email: dto.email } },
            });
            if (existing) {
                throw new common_1.BadRequestException('A user with this email already exists');
            }
        }
        if (dto.phone) {
            const existing = await this.prisma.user.findUnique({
                where: { orgId_phone: { orgId, phone: dto.phone } },
            });
            if (existing) {
                throw new common_1.BadRequestException('A user with this phone already exists');
            }
        }
        const passwordHash = dto.password
            ? await bcrypt.hash(dto.password, 10)
            : null;
        return this.prisma.user.create({
            data: {
                orgId,
                name: dto.name,
                email: dto.email || null,
                phone: dto.phone || null,
                role: dto.role,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    async updateUser(orgId, userId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, orgId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.isActive === false && user.role === 'ADMIN') {
            const adminCount = await this.prisma.user.count({
                where: { orgId, role: 'ADMIN', isActive: true },
            });
            if (adminCount <= 1) {
                throw new common_1.BadRequestException('Cannot deactivate the last admin');
            }
        }
        if (dto.role && dto.role !== 'ADMIN' && user.role === 'ADMIN') {
            const adminCount = await this.prisma.user.count({
                where: { orgId, role: 'ADMIN', isActive: true },
            });
            if (adminCount <= 1) {
                throw new common_1.BadRequestException('Cannot change role of the last admin');
            }
        }
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.email !== undefined)
            updateData.email = dto.email || null;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone || null;
        if (dto.role !== undefined)
            updateData.role = dto.role;
        if (dto.isActive !== undefined)
            updateData.isActive = dto.isActive;
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    async listServiceTypes(orgId) {
        return this.prisma.orgServiceType.findMany({
            where: { orgId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async upsertServiceType(orgId, dto) {
        return this.prisma.orgServiceType.upsert({
            where: {
                orgId_serviceType: { orgId, serviceType: dto.serviceType },
            },
            create: {
                orgId,
                serviceType: dto.serviceType,
                label: dto.label,
                isActive: dto.isActive ?? true,
            },
            update: {
                label: dto.label,
                isActive: dto.isActive ?? true,
            },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map