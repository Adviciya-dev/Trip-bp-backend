export declare class CreateCommissionRuleDto {
    subAgencyId: string;
    commissionType: 'PERCENTAGE' | 'FIXED';
    value: number;
    commissionBase: 'FINAL_FARE' | 'NET_FARE';
    serviceType?: 'AIRPORT_TRANSFER' | 'ONE_DAY' | 'MULTI_DAY';
}
