import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrgDto } from './dto/update-org.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertServiceTypeDto } from './dto/upsert-service-type.dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrg(orgId: string): Promise<{
        id: string;
        name: string;
        logo: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        timezone: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateOrg(orgId: string, dto: UpdateOrgDto): Promise<{
        id: string;
        name: string;
        logo: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        timezone: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listUsers(orgId: string): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        lastLoginAt: Date | null;
    }[]>;
    createUser(orgId: string, dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    updateUser(orgId: string, userId: string, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    listServiceTypes(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        label: string;
    }[]>;
    upsertServiceType(orgId: string, dto: UpsertServiceTypeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        label: string;
    }>;
}
