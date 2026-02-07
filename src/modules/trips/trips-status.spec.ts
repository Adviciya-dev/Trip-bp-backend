import { TripsService } from './trips.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CommissionsService } from '../commissions/commissions.service';
import { ChatService } from '../chat/chat.service';
import { TripStatus } from '@prisma/client';

/**
 * Test the trip status state machine transitions.
 * Since getAllowedTransitions is private, we test via updateStatus which throws
 * BadRequestException on invalid transitions.
 */
describe('TripsService — Status Transitions', () => {
  let service: TripsService;
  let prismaMock: Record<string, unknown>;

  beforeEach(() => {
    prismaMock = {
      trip: {
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      tripStatusLog: { create: jest.fn() },
      $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
        fn(prismaMock),
      ),
    };

    service = new TripsService(
      prismaMock as unknown as PrismaService,
      { calculateCommission: jest.fn() } as unknown as CommissionsService,
      {
        createSystemMessage: jest.fn().mockResolvedValue(undefined),
      } as unknown as ChatService,
    );
  });

  // Helper: set up findOne to return a trip with given status
  function setupTrip(status: TripStatus, extras: Record<string, unknown> = {}) {
    (prismaMock.trip as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
      id: 'trip-1',
      orgId: 'org-1',
      status,
      trackingToken: null,
      assignment: null,
      ...extras,
    });
  }

  const actor = { userId: 'user-1', orgId: 'org-1', role: 'ADMIN' };

  // Define expected valid transitions
  const validTransitions: [TripStatus, TripStatus[]][] = [
    [TripStatus.DRAFT, [TripStatus.CONFIRMED, TripStatus.CANCELLED]],
    [
      TripStatus.CONFIRMED,
      [TripStatus.READY_FOR_ASSIGNMENT, TripStatus.CANCELLED],
    ],
    [
      TripStatus.READY_FOR_ASSIGNMENT,
      [
        TripStatus.ASSIGNED_INTERNAL,
        TripStatus.ASSIGNED_SUB_AGENCY,
        TripStatus.CANCELLED,
      ],
    ],
    [
      TripStatus.ASSIGNED_INTERNAL,
      [TripStatus.ENROUTE, TripStatus.CANCELLED, TripStatus.NO_SHOW],
    ],
    [
      TripStatus.ASSIGNED_SUB_AGENCY,
      [TripStatus.ENROUTE, TripStatus.CANCELLED, TripStatus.NO_SHOW],
    ],
    [
      TripStatus.ENROUTE,
      [TripStatus.PICKED_UP, TripStatus.CANCELLED, TripStatus.NO_SHOW],
    ],
    [TripStatus.PICKED_UP, [TripStatus.COMPLETED, TripStatus.CANCELLED]],
  ];

  // Terminal states: no transitions allowed
  const terminalStates = [
    TripStatus.COMPLETED,
    TripStatus.CANCELLED,
    TripStatus.NO_SHOW,
  ];

  describe('valid transitions', () => {
    for (const [from, allowedTargets] of validTransitions) {
      for (const to of allowedTargets) {
        it(`should allow ${from} → ${to}`, async () => {
          setupTrip(from);

          // The method will call findOne twice (once for validation, once after update)
          await expect(
            service.updateStatus('trip-1', { status: to }, actor),
          ).resolves.toBeDefined();
        });
      }
    }
  });

  describe('invalid transitions', () => {
    const allStatuses = Object.values(TripStatus);

    for (const [from, allowedTargets] of validTransitions) {
      const invalidTargets = allStatuses.filter(
        (s) => s !== from && !allowedTargets.includes(s),
      );
      for (const to of invalidTargets) {
        it(`should reject ${from} → ${to}`, async () => {
          setupTrip(from);

          await expect(
            service.updateStatus('trip-1', { status: to }, actor),
          ).rejects.toThrow(`Cannot transition from ${from} to ${to}`);
        });
      }
    }
  });

  describe('terminal states', () => {
    for (const state of terminalStates) {
      it(`should not allow any transition from ${state}`, async () => {
        setupTrip(state);

        for (const target of Object.values(TripStatus)) {
          if (target === state) continue;
          await expect(
            service.updateStatus('trip-1', { status: target }, actor),
          ).rejects.toThrow('Cannot transition');
        }
      });
    }
  });
});
