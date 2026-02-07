import { PricingService } from './pricing.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(() => {
    // We only need PrismaService for DB methods; computeFare is pure
    service = new PricingService({} as PrismaService);
  });

  describe('computeFare', () => {
    const baseRule = {
      minFare: 500,
      includedKm: 10,
      ratePerKm: 15,
      extraKmRate: 12,
    };

    it('should return minFare when distance is within included km', () => {
      expect(service.computeFare(baseRule, 5)).toBe(500);
    });

    it('should return minFare when distance equals included km exactly', () => {
      expect(service.computeFare(baseRule, 10)).toBe(500);
    });

    it('should calculate extra km charges when distance exceeds included km', () => {
      // 10km * 15 + 10km extra * 12 = 150 + 120 = 270, but minFare is 500 → 500
      expect(service.computeFare(baseRule, 20)).toBe(500);
    });

    it('should exceed minFare for large distances', () => {
      // 10km * 15 + 90km extra * 12 = 150 + 1080 = 1230 > 500
      expect(service.computeFare(baseRule, 100)).toBe(1230);
    });

    it('should return minFare for 0 km distance', () => {
      expect(service.computeFare(baseRule, 0)).toBe(500);
    });

    it('should handle rule with 0 included km', () => {
      const rule = {
        minFare: 100,
        includedKm: 0,
        ratePerKm: 10,
        extraKmRate: 10,
      };
      // 0 * 10 + 25 * 10 = 250 > 100
      expect(service.computeFare(rule, 25)).toBe(250);
    });

    it('should handle rule with 0 included km and small distance (minFare wins)', () => {
      const rule = {
        minFare: 200,
        includedKm: 0,
        ratePerKm: 10,
        extraKmRate: 10,
      };
      // 0 * 10 + 5 * 10 = 50 < 200 → 200
      expect(service.computeFare(rule, 5)).toBe(200);
    });

    it('should handle fractional distances correctly', () => {
      // 10km * 15 + 5.5km extra * 12 = 150 + 66 = 216 < 500 → 500
      expect(service.computeFare(baseRule, 15.5)).toBe(500);
    });

    it('should handle high extraKmRate', () => {
      const rule = {
        minFare: 100,
        includedKm: 5,
        ratePerKm: 10,
        extraKmRate: 50,
      };
      // 5 * 10 + 15 * 50 = 50 + 750 = 800
      expect(service.computeFare(rule, 20)).toBe(800);
    });

    it('should return minFare when computed is exactly equal to minFare', () => {
      // Design: includedKm=10, ratePerKm=10, extraKmRate=10
      // 10*10 + 0*10 = 100 = minFare
      const rule = {
        minFare: 100,
        includedKm: 10,
        ratePerKm: 10,
        extraKmRate: 10,
      };
      expect(service.computeFare(rule, 10)).toBe(100);
    });
  });
});
