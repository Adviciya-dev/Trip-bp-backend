import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.vehicle.findMany({
      where: { orgId },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { plateNumber: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, orgId },
      include: {
        driver: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto, orgId: string) {
    // Check plate uniqueness in org
    const existing = await this.prisma.vehicle.findFirst({
      where: { orgId, plateNumber: dto.plateNumber },
    });
    if (existing) {
      throw new ConflictException(
        'A vehicle with this plate number already exists',
      );
    }

    // If driver assigned, verify driver exists and isn't already linked
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

  async update(id: string, dto: UpdateVehicleDto, orgId: string) {
    await this.findOne(id, orgId);

    // If plate changes, check uniqueness
    if (dto.plateNumber) {
      const conflict = await this.prisma.vehicle.findFirst({
        where: { orgId, plateNumber: dto.plateNumber, id: { not: id } },
      });
      if (conflict) {
        throw new ConflictException(
          'A vehicle with this plate number already exists',
        );
      }
    }

    // If driver changes, validate
    if (dto.driverId) {
      await this.validateDriverAssignment(dto.driverId, orgId, id);
    }

    const data: Record<string, unknown> = {};
    if (dto.plateNumber !== undefined) data.plateNumber = dto.plateNumber;
    if (dto.vehicleType !== undefined) data.vehicleType = dto.vehicleType;
    if (dto.seats !== undefined) data.seats = dto.seats;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    // driverId can be null (unlink) or a string (link)
    if (dto.driverId !== undefined) data.driverId = dto.driverId || null;

    return this.prisma.vehicle.update({
      where: { id },
      data: data as never,
      include: {
        driver: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  private async validateDriverAssignment(
    driverId: string,
    orgId: string,
    excludeVehicleId?: string,
  ) {
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, orgId, deletedAt: null },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Check if driver is already assigned to another vehicle
    const existingVehicle = await this.prisma.vehicle.findFirst({
      where: {
        driverId,
        ...(excludeVehicleId ? { id: { not: excludeVehicleId } } : {}),
      },
    });
    if (existingVehicle) {
      throw new ConflictException(
        `Driver is already assigned to vehicle ${existingVehicle.plateNumber}`,
      );
    }
  }
}
