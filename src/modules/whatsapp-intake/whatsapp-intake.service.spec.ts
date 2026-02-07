/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { WhatsAppIntakeService } from './whatsapp-intake.service';
import { PrismaService } from '../../prisma/prisma.service';

function createMockPrisma() {
  return {
    whatsAppConversation: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    trip: {
      create: jest.fn().mockResolvedValue({
        id: 'trip-1',
        tripNumber: 'TRP-260206-001',
      }),
      count: jest.fn().mockResolvedValue(0),
    },
  } as unknown as PrismaService;
}

describe('WhatsAppIntakeService', () => {
  let service: WhatsAppIntakeService;
  let prisma: ReturnType<typeof createMockPrisma>;

  const orgId = 'org-1';
  const phone = '+919876543210';
  const name = 'Test Customer';

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new WhatsAppIntakeService(prisma);
  });

  describe('processMessage — new conversation', () => {
    it('should start new conversation on greeting', async () => {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const reply = await service.processMessage(orgId, phone, name, 'Hi');

      expect(prisma.whatsAppConversation.upsert).toHaveBeenCalled();
      expect(reply).toContain('What type of service');
    });

    it('should start new conversation on first message from unknown phone', async () => {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const reply = await service.processMessage(
        orgId,
        phone,
        name,
        'I need a cab',
      );

      expect(reply).toContain('What type of service');
    });
  });

  describe('processMessage — restart keywords', () => {
    for (const keyword of ['restart', 'start over', 'reset', 'hello']) {
      it(`should restart conversation on "${keyword}"`, async () => {
        const reply = await service.processMessage(orgId, phone, name, keyword);

        expect(prisma.whatsAppConversation.upsert).toHaveBeenCalled();
        expect(reply).toContain('What type of service');
      });
    }
  });

  describe('processMessage — service type parsing', () => {
    function setupConvo(step: number, data = {}) {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'convo-1',
        orgId,
        phone,
        step,
        data,
        isComplete: false,
        customerName: name,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    it('should accept "1" as AIRPORT_TRANSFER', async () => {
      setupConvo(0);

      const reply = await service.processMessage(orgId, phone, name, '1');

      expect(prisma.whatsAppConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            step: 1,
            data: expect.objectContaining({
              serviceType: 'AIRPORT_TRANSFER',
            }),
          }),
        }),
      );
      expect(reply).toContain('pickup');
    });

    it('should accept "airport transfer" (case-insensitive)', async () => {
      setupConvo(0);

      const reply = await service.processMessage(
        orgId,
        phone,
        name,
        'Airport Transfer',
      );

      expect(reply).toContain('pickup');
    });

    it('should accept "2" as ONE_DAY', async () => {
      setupConvo(0);

      await service.processMessage(orgId, phone, name, '2');

      expect(prisma.whatsAppConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            data: expect.objectContaining({
              serviceType: 'ONE_DAY',
            }),
          }),
        }),
      );
    });

    it('should reject invalid service type', async () => {
      setupConvo(0);

      const reply = await service.processMessage(
        orgId,
        phone,
        name,
        'submarine',
      );

      expect(reply).toContain('valid option');
      // Should NOT advance step
      expect(prisma.whatsAppConversation.update).not.toHaveBeenCalled();
    });
  });

  describe('processMessage — date validation', () => {
    function setupConvo(step: number, data = {}) {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'convo-1',
        orgId,
        phone,
        step,
        data,
        isComplete: false,
        customerName: name,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    it('should accept valid future date', async () => {
      setupConvo(3, {
        serviceType: 'AIRPORT_TRANSFER',
        pickupAddress: 'Airport',
        dropAddress: 'Hotel',
      });

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const dateStr = futureDate.toISOString();

      const reply = await service.processMessage(orgId, phone, name, dateStr);

      expect(reply).toContain('passengers');
    });

    it('should reject invalid date string', async () => {
      setupConvo(3, {
        serviceType: 'AIRPORT_TRANSFER',
        pickupAddress: 'Airport',
        dropAddress: 'Hotel',
      });

      const reply = await service.processMessage(
        orgId,
        phone,
        name,
        'not a date',
      );

      expect(reply).toContain("couldn't understand");
    });

    it('should reject past date', async () => {
      setupConvo(3, {
        serviceType: 'AIRPORT_TRANSFER',
        pickupAddress: 'Airport',
        dropAddress: 'Hotel',
      });

      const reply = await service.processMessage(
        orgId,
        phone,
        name,
        '2020-01-01',
      );

      expect(reply).toContain('past');
    });
  });

  describe('processMessage — passenger count validation', () => {
    function setupConvo(step: number, data = {}) {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'convo-1',
        orgId,
        phone,
        step,
        data,
        isComplete: false,
        customerName: name,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
    }

    it('should accept valid passenger count', async () => {
      setupConvo(4, {
        serviceType: 'AIRPORT_TRANSFER',
        pickupAddress: 'Airport',
        dropAddress: 'Hotel',
        scheduledAt: new Date().toISOString(),
      });

      const reply = await service.processMessage(orgId, phone, name, '3');

      expect(reply).toContain('special requests');
    });

    it('should reject non-numeric input', async () => {
      setupConvo(4, {
        serviceType: 'AIRPORT_TRANSFER',
        pickupAddress: 'Airport',
        dropAddress: 'Hotel',
        scheduledAt: new Date().toISOString(),
      });

      const reply = await service.processMessage(orgId, phone, name, 'two');

      expect(reply).toContain('valid number');
    });

    it('should reject 0 passengers', async () => {
      setupConvo(4, {
        serviceType: 'AIRPORT_TRANSFER',
        pickupAddress: 'Airport',
        dropAddress: 'Hotel',
        scheduledAt: new Date().toISOString(),
      });

      const reply = await service.processMessage(orgId, phone, name, '0');

      expect(reply).toContain('valid number');
    });
  });

  describe('processMessage — completing the flow', () => {
    it('should create draft trip on final step', async () => {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'convo-1',
        orgId,
        phone,
        step: 5,
        data: {
          serviceType: 'AIRPORT_TRANSFER',
          pickupAddress: 'Airport Terminal 2',
          dropAddress: 'Hotel Grand',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          paxCount: 2,
        },
        isComplete: false,
        customerName: name,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      const reply = await service.processMessage(
        orgId,
        phone,
        name,
        'No special requests',
      );

      expect(prisma.trip.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orgId,
          source: 'WHATSAPP_INTAKE',
          status: 'DRAFT',
          customerName: name,
          customerPhone: phone,
          serviceType: 'AIRPORT_TRANSFER',
          pickupAddress: 'Airport Terminal 2',
          dropAddress: 'Hotel Grand',
        }),
      });
      expect(prisma.whatsAppConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isComplete: true }),
        }),
      );
      expect(reply).toContain('TRP-260206-001');
      expect(reply).toContain('created');
    });

    it('should handle "skip" for special requests', async () => {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'convo-1',
        orgId,
        phone,
        step: 5,
        data: {
          serviceType: 'ONE_DAY',
          pickupAddress: 'Hotel',
          dropAddress: 'City Tour',
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          paxCount: 4,
        },
        isComplete: false,
        customerName: name,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      const reply = await service.processMessage(orgId, phone, name, 'skip');

      expect(prisma.trip.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notes: null,
        }),
      });
      expect(reply).toContain('created');
    });
  });

  describe('processMessage — expired conversation', () => {
    it('should restart when conversation is expired', async () => {
      (prisma.whatsAppConversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'convo-1',
        orgId,
        phone,
        step: 3,
        data: { serviceType: 'AIRPORT_TRANSFER' },
        isComplete: false,
        customerName: name,
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      const reply = await service.processMessage(orgId, phone, name, 'Airport');

      expect(prisma.whatsAppConversation.upsert).toHaveBeenCalled();
      expect(reply).toContain('What type of service');
    });
  });
});
