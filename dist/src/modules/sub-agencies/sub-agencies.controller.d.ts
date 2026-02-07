import { SubAgenciesService } from './sub-agencies.service';
import { CreateSubAgencyDto } from './dto/create-sub-agency.dto';
import { UpdateSubAgencyDto } from './dto/update-sub-agency.dto';
import { QuerySubAgenciesDto } from './dto/query-sub-agencies.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class SubAgenciesController {
    private subAgenciesService;
    constructor(subAgenciesService: SubAgenciesService);
    findAll(query: QuerySubAgenciesDto, user: JwtPayload): Promise<{
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
    findOne(id: string, user: JwtPayload): Promise<{
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
    create(dto: CreateSubAgencyDto, user: JwtPayload): Promise<{
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
    update(id: string, dto: UpdateSubAgencyDto, user: JwtPayload): Promise<{
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
    remove(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
}
