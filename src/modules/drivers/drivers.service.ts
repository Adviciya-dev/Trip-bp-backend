import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryDriversDto, orgId: string) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '50', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      orgId,
      deletedAt: null,
    };

    if (query.status === 'active') where.isActive = true;
    if (query.status === 'inactive') where.isActive = false;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: where as never,
        include: {
          vehicle: {
            select: { id: true, plateNumber: true, vehicleType: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.driver.count({ where: where as never }),
    ]);

    return {
      items: drivers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, orgId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        vehicle: true,
        user: { select: { id: true, email: true, phone: true, role: true } },
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async create(dto: CreateDriverDto, orgId: string) {
    // Check phone uniqueness within org
    const existingPhone = await this.prisma.driver.findFirst({
      where: { orgId, phone: dto.phone, deletedAt: null },
    });
    if (existingPhone) {
      throw new ConflictException('A driver with this phone already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create a User account with DRIVER role
      const user = await tx.user.create({
        data: {
          orgId,
          name: dto.name,
          phone: dto.phone,
          email: dto.email || null,
          role: UserRole.DRIVER,
          isActive: true,
        },
      });

      // Create the Driver record linked to the User
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

  async update(id: string, dto: UpdateDriverDto, orgId: string) {
    const existing = await this.findOne(id, orgId);

    // If phone changes, check uniqueness
    if (dto.phone && dto.phone !== existing.phone) {
      const conflict = await this.prisma.driver.findFirst({
        where: { orgId, phone: dto.phone, deletedAt: null, id: { not: id } },
      });
      if (conflict) {
        throw new ConflictException('A driver with this phone already exists');
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.email !== undefined) data.email = dto.email || null;
    if (dto.licenseNumber !== undefined) data.licenseNumber = dto.licenseNumber;
    if (dto.licenseExpiry !== undefined)
      data.licenseExpiry = dto.licenseExpiry
        ? new Date(dto.licenseExpiry)
        : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: data as never,
      });

      // Sync key fields to User record
      const userData: Record<string, unknown> = {};
      if (dto.name !== undefined) userData.name = dto.name;
      if (dto.phone !== undefined) userData.phone = dto.phone;
      if (dto.email !== undefined) userData.email = dto.email || null;
      if (dto.isActive !== undefined) userData.isActive = dto.isActive;

      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: existing.userId },
          data: userData as never,
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

  async softDelete(id: string, orgId: string) {
    await this.findOne(id, orgId);

    await this.prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Driver deleted' };
  }
}
