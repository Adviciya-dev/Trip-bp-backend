import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubAgencyDto } from './dto/create-sub-agency.dto';
import { UpdateSubAgencyDto } from './dto/update-sub-agency.dto';
import { QuerySubAgenciesDto } from './dto/query-sub-agencies.dto';
export declare class SubAgenciesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QuerySubAgenciesDto, orgId: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        deletedAt: Date | null;
        contactPerson: string | null;
        servicesAllowed: import(".prisma/client").$Enums.ServiceType[];
        settlementCycle: string;
    }[]>;
    findOne(id: string, orgId: string): Promise<{
        users: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
        }[];
    } & {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        deletedAt: Date | null;
        contactPerson: string | null;
        servicesAllowed: import(".prisma/client").$Enums.ServiceType[];
        settlementCycle: string;
    }>;
    create(dto: CreateSubAgencyDto, orgId: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        deletedAt: Date | null;
        contactPerson: string | null;
        servicesAllowed: import(".prisma/client").$Enums.ServiceType[];
        settlementCycle: string;
    }>;
    update(id: string, dto: UpdateSubAgencyDto, orgId: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        deletedAt: Date | null;
        contactPerson: string | null;
        servicesAllowed: import(".prisma/client").$Enums.ServiceType[];
        settlementCycle: string;
    }>;
    softDelete(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
