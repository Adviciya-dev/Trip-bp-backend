import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { UpdateOrgDto } from './dto/update-org.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertServiceTypeDto } from './dto/upsert-service-type.dto';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getOrg(user: JwtPayload): Promise<{
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
    updateOrg(user: JwtPayload, dto: UpdateOrgDto): Promise<{
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
    listUsers(user: JwtPayload): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        lastLoginAt: Date | null;
    }[]>;
    createUser(user: JwtPayload, dto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    updateUser(user: JwtPayload, userId: string, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    listServiceTypes(user: JwtPayload): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        label: string;
    }[]>;
    upsertServiceType(user: JwtPayload, dto: UpsertServiceTypeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        serviceType: import(".prisma/client").$Enums.ServiceType;
        label: string;
    }>;
}
