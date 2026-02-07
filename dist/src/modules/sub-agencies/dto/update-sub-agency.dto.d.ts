import { ServiceType } from '@prisma/client';
export declare class UpdateSubAgencyDto {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    servicesAllowed?: ServiceType[];
    settlementCycle?: string;
    isActive?: boolean;
}
