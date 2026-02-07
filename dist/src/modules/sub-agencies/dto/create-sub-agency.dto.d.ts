import { ServiceType } from '@prisma/client';
export declare class CreateSubAgencyDto {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    servicesAllowed?: ServiceType[];
    settlementCycle?: string;
}
