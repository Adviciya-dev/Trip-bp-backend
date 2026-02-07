import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrgDto } from './dto/update-org.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertServiceTypeDto } from './dto/upsert-service-type.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // --- Organization ---

  async getOrg(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateOrg(orgId: string, dto: UpdateOrgDto) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: dto,
    });
  }

  // --- Users ---

  async listUsers(orgId: string) {
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

  async createUser(orgId: string, dto: CreateUserDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email or phone is required');
    }

    // Check for duplicate
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { orgId_email: { orgId, email: dto.email } },
      });
      if (existing) {
        throw new BadRequestException('A user with this email already exists');
      }
    }
    if (dto.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { orgId_phone: { orgId, phone: dto.phone } },
      });
      if (existing) {
        throw new BadRequestException('A user with this phone already exists');
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

  async updateUser(orgId: string, userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, orgId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Prevent deactivating the last admin
    if (dto.isActive === false && user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { orgId, role: 'ADMIN', isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot deactivate the last admin');
      }
    }

    // Prevent demoting the last admin
    if (dto.role && dto.role !== 'ADMIN' && user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({
        where: { orgId, role: 'ADMIN', isActive: true },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot change role of the last admin');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email || null;
    if (dto.phone !== undefined) updateData.phone = dto.phone || null;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData as never,
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

  // --- Service Types ---

  async listServiceTypes(orgId: string) {
    return this.prisma.orgServiceType.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsertServiceType(orgId: string, dto: UpsertServiceTypeDto) {
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
}
