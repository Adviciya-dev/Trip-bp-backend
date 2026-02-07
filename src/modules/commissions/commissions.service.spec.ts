/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { CommissionsService } from './commissions.service';
import { PrismaService } from '../../prisma/prisma.service';

// Helper to create a deeply mockable PrismaService
function createMockPrisma() {
  return {
    trip: { findFirst: jest.fn() },
    commissionLedger: { findUnique: jest.fn(), create: jest.fn() },
    commissionRule: { findFirst: jest.fn() },
  } as unknown as PrismaService;
}

describe('CommissionsService', () => {
  let service: CommissionsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new CommissionsService(prisma);
  });

  describe('calculateCommission', () => {
    const orgId = 'org-1';
    const tripId = 'trip-1';

    it('should skip if trip not found', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue(null);

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).not.toHaveBeenCalled();
    });

    it('should skip if trip has no sub-agency assignment', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: null },
        pricing: { finalFare: 1000 },
        expenses: [],
      });

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).not.toHaveBeenCalled();
    });

    it('should skip if commission already exists', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 1000 },
        expenses: [],
        serviceType: 'AIRPORT_TRANSFER',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing',
      });

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).not.toHaveBeenCalled();
    });

    it('should skip if no applicable rule', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 1000 },
        expenses: [],
        serviceType: 'AIRPORT_TRANSFER',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValue(null);

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).not.toHaveBeenCalled();
    });

    it('should skip if fare is 0', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 0, estimatedFare: 0 },
        expenses: [],
        serviceType: 'AIRPORT_TRANSFER',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValue({
        commissionType: 'PERCENTAGE',
        value: 10,
        commissionBase: 'FINAL_FARE',
      });

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).not.toHaveBeenCalled();
    });

    it('should calculate PERCENTAGE commission on FINAL_FARE', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 2000, estimatedFare: 1800 },
        expenses: [],
        serviceType: 'AIRPORT_TRANSFER',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      // First call: service-specific rule → return it
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValueOnce({
        commissionType: 'PERCENTAGE',
        value: 15,
        commissionBase: 'FINAL_FARE',
      });

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tripId,
          subAgencyId: 'agency-1',
          fareAmount: 2000,
          commission: 300, // 15% of 2000
          status: 'PENDING',
        }),
      });
    });

    it('should calculate FIXED commission', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 2000 },
        expenses: [],
        serviceType: 'AIRPORT_TRANSFER',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValueOnce({
        commissionType: 'FIXED',
        value: 500,
        commissionBase: 'FINAL_FARE',
      });

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          commission: 500,
          fareAmount: 2000,
        }),
      });
    });

    it('should calculate commission on NET_FARE (fare minus approved expenses)', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 3000 },
        expenses: [{ amount: 200 }, { amount: 300 }], // 500 total expenses
        serviceType: 'ONE_DAY',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValueOnce({
        commissionType: 'PERCENTAGE',
        value: 10,
        commissionBase: 'NET_FARE',
      });

      await service.calculateCommission(tripId, orgId);

      // Net fare = 3000 - 500 = 2500, 10% = 250
      expect(prisma.commissionLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          commission: 250,
          fareAmount: 3000,
        }),
      });
    });

    it('should use estimatedFare when finalFare is null', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: null, estimatedFare: 1500 },
        expenses: [],
        serviceType: 'AIRPORT_TRANSFER',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValueOnce({
        commissionType: 'PERCENTAGE',
        value: 20,
        commissionBase: 'FINAL_FARE',
      });

      await service.calculateCommission(tripId, orgId);

      expect(prisma.commissionLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          commission: 300, // 20% of 1500
          fareAmount: 1500,
        }),
      });
    });

    it('should floor net fare to 0 when expenses exceed fare', async () => {
      (prisma.trip.findFirst as jest.Mock).mockResolvedValue({
        id: tripId,
        assignment: { subAgencyId: 'agency-1' },
        pricing: { finalFare: 500 },
        expenses: [{ amount: 400 }, { amount: 300 }], // 700 > 500
        serviceType: 'ONE_DAY',
      });
      (prisma.commissionLedger.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionRule.findFirst as jest.Mock).mockResolvedValueOnce({
        commissionType: 'PERCENTAGE',
        value: 10,
        commissionBase: 'NET_FARE',
      });

      await service.calculateCommission(tripId, orgId);

      // Net fare = max(0, 500 - 700) = 0, 10% of 0 = 0
      expect(prisma.commissionLedger.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          commission: 0,
        }),
      });
    });
  });
});
