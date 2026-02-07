export declare class UpdateCommissionRuleDto {
    commissionType?: 'PERCENTAGE' | 'FIXED';
    value?: number;
    commissionBase?: 'FINAL_FARE' | 'NET_FARE';
    serviceType?: 'AIRPORT_TRANSFER' | 'ONE_DAY' | 'MULTI_DAY' | null;
    isActive?: boolean;
}
