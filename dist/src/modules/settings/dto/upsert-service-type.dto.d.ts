import { ServiceType } from '@prisma/client';
export declare class UpsertServiceTypeDto {
    serviceType: ServiceType;
    label: string;
    isActive?: boolean;
}
