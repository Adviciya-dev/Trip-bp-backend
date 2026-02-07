import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateSubAgencyDto } from './dto/create-sub-agency.dto';
import { UpdateSubAgencyDto } from './dto/update-sub-agency.dto';
import { QuerySubAgenciesDto } from './dto/query-sub-agencies.dto';

@Injectable()
export class SubAgenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySubAgenciesDto, orgId: string) {
    const where: Record<string, unknown> = {
      orgId,
      deletedAt: null,
    };

    if (query.status === 'active') where.isActive = true;
    if (query.status === 'inactive') where.isActive = false;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    return this.prisma.subAgency.findMany({
      where: where as never,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const agency = await this.prisma.subAgency.findFirst({
      where: { id, orgId, deletedAt: null },
      include: {
        users: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!agency) {
      throw new NotFoundException('Sub-agency not found');
    }

    return agency;
  }

  async create(dto: CreateSubAgencyDto, orgId: string) {
    // Check name uniqueness within org
    const existing = await this.prisma.subAgency.findFirst({
      where: { orgId, name: dto.name, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('A sub-agency with this name already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create the SubAgency record
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

      // Create a User account with SUB_AGENCY_USER role if email or phone provided
      if (dto.email || dto.phone) {
        await tx.user.create({
          data: {
            orgId,
            name: dto.contactPerson || dto.name,
            email: dto.email || null,
            phone: dto.phone || null,
            role: UserRole.SUB_AGENCY_USER,
            isActive: true,
            subAgencyId: agency.id,
          },
        });
      }

      return agency;
    });
  }

  async update(id: string, dto: UpdateSubAgencyDto, orgId: string) {
    await this.findOne(id, orgId);

    // If name changes, check uniqueness
    if (dto.name) {
      const conflict = await this.prisma.subAgency.findFirst({
        where: { orgId, name: dto.name, deletedAt: null, id: { not: id } },
      });
      if (conflict) {
        throw new ConflictException(
          'A sub-agency with this name already exists',
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.contactPerson !== undefined)
      data.contactPerson = dto.contactPerson || null;
    if (dto.phone !== undefined) data.phone = dto.phone || null;
    if (dto.email !== undefined) data.email = dto.email || null;
    if (dto.address !== undefined) data.address = dto.address || null;
    if (dto.servicesAllowed !== undefined)
      data.servicesAllowed = dto.servicesAllowed;
    if (dto.settlementCycle !== undefined)
      data.settlementCycle = dto.settlementCycle;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.subAgency.update({
      where: { id },
      data: data as never,
    });
  }

  async softDelete(id: string, orgId: string) {
    await this.findOne(id, orgId);

    await this.prisma.subAgency.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Sub-agency deleted' };
  }
}
