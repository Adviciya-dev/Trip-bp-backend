import { PrismaClient, UserRole, ServiceType, CommissionType, CommissionBase, TripStatus, TripSource } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'TripBH Demo Org',
      email: 'admin@tripbh.com',
      phone: '+919876543210',
      address: 'Bhopal, India',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });
  console.log(`Created org: ${org.name} (${org.id})`);

  // 2. Create Admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Admin User',
      email: 'admin@tripbh.com',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`Created admin: ${adminUser.name}`);

  // 3. Create Dispatcher user
  const dispatcherPasswordHash = await bcrypt.hash('dispatch123', 10);
  const dispatcherUser = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Dispatch Ops',
      email: 'dispatch@tripbh.com',
      phone: '+919876543211',
      passwordHash: dispatcherPasswordHash,
      role: UserRole.DISPATCHER,
    },
  });
  console.log(`Created dispatcher: ${dispatcherUser.name}`);

  // 4. Create Driver users + Driver records
  const driverPasswordHash = await bcrypt.hash('driver123', 10);

  const driverUser1 = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Rajesh Kumar',
      phone: '+919876543212',
      passwordHash: driverPasswordHash,
      role: UserRole.DRIVER,
    },
  });
  const driver1 = await prisma.driver.create({
    data: {
      orgId: org.id,
      userId: driverUser1.id,
      name: 'Rajesh Kumar',
      phone: '+919876543212',
      licenseNumber: 'MP09-2024-001234',
      licenseExpiry: new Date('2027-06-15'),
    },
  });
  console.log(`Created driver: ${driver1.name}`);

  const driverUser2 = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Sunil Verma',
      phone: '+919876543213',
      passwordHash: driverPasswordHash,
      role: UserRole.DRIVER,
    },
  });
  const driver2 = await prisma.driver.create({
    data: {
      orgId: org.id,
      userId: driverUser2.id,
      name: 'Sunil Verma',
      phone: '+919876543213',
      licenseNumber: 'MP09-2023-005678',
      licenseExpiry: new Date('2026-12-31'),
    },
  });
  console.log(`Created driver: ${driver2.name}`);

  // 5. Create Vehicles and assign to drivers
  const vehicle1 = await prisma.vehicle.create({
    data: {
      orgId: org.id,
      plateNumber: 'MP 09 AB 1234',
      vehicleType: 'Sedan',
      seats: 4,
      driverId: driver1.id,
    },
  });
  console.log(`Created vehicle: ${vehicle1.plateNumber}`);

  const vehicle2 = await prisma.vehicle.create({
    data: {
      orgId: org.id,
      plateNumber: 'MP 09 CD 5678',
      vehicleType: 'SUV',
      seats: 7,
      driverId: driver2.id,
    },
  });
  console.log(`Created vehicle: ${vehicle2.plateNumber}`);

  // 6. Create Sub-Agency
  const subAgencyUser = await prisma.user.create({
    data: {
      orgId: org.id,
      name: 'Star Travels Manager',
      email: 'star@travels.com',
      phone: '+919876543214',
      passwordHash: await bcrypt.hash('agency123', 10),
      role: UserRole.SUB_AGENCY_USER,
    },
  });

  const subAgency = await prisma.subAgency.create({
    data: {
      orgId: org.id,
      name: 'Star Travels',
      contactPerson: 'Amit Shah',
      phone: '+919876543214',
      email: 'star@travels.com',
      servicesAllowed: [ServiceType.AIRPORT_TRANSFER, ServiceType.ONE_DAY],
      settlementCycle: 'MONTHLY',
    },
  });

  // Link sub-agency user
  await prisma.user.update({
    where: { id: subAgencyUser.id },
    data: { subAgencyId: subAgency.id },
  });
  console.log(`Created sub-agency: ${subAgency.name}`);

  // 7. Create Pricing Rules
  const pricingRules = await Promise.all([
    prisma.pricingRule.create({
      data: {
        orgId: org.id,
        serviceType: ServiceType.AIRPORT_TRANSFER,
        ratePerKm: 15,
        minFare: 500,
        includedKm: 20,
        extraKmRate: 18,
        effectiveFrom: new Date('2024-01-01'),
      },
    }),
    prisma.pricingRule.create({
      data: {
        orgId: org.id,
        serviceType: ServiceType.ONE_DAY,
        ratePerKm: 12,
        minFare: 2000,
        includedKm: 100,
        extraKmRate: 14,
        effectiveFrom: new Date('2024-01-01'),
      },
    }),
    prisma.pricingRule.create({
      data: {
        orgId: org.id,
        serviceType: ServiceType.MULTI_DAY,
        ratePerKm: 10,
        minFare: 3500,
        includedKm: 200,
        extraKmRate: 12,
        effectiveFrom: new Date('2024-01-01'),
      },
    }),
  ]);
  console.log(`Created ${pricingRules.length} pricing rules`);

  // 8. Create Commission Rule for sub-agency
  const commissionRule = await prisma.commissionRule.create({
    data: {
      orgId: org.id,
      subAgencyId: subAgency.id,
      commissionType: CommissionType.PERCENTAGE,
      value: 15,
      commissionBase: CommissionBase.FINAL_FARE,
    },
  });
  console.log(`Created commission rule: ${commissionRule.value}% for ${subAgency.name}`);

  // 9. Create Service Type configs
  await Promise.all([
    prisma.orgServiceType.create({
      data: { orgId: org.id, serviceType: ServiceType.AIRPORT_TRANSFER, label: 'Airport Transfer' },
    }),
    prisma.orgServiceType.create({
      data: { orgId: org.id, serviceType: ServiceType.ONE_DAY, label: 'One Day Trip' },
    }),
    prisma.orgServiceType.create({
      data: { orgId: org.id, serviceType: ServiceType.MULTI_DAY, label: 'Multi Day Trip' },
    }),
  ]);
  console.log('Created service type configs');

  // 10. Create sample trips
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const trip1 = await prisma.trip.create({
    data: {
      orgId: org.id,
      tripNumber: 'TRP-0001',
      status: TripStatus.DRAFT,
      serviceType: ServiceType.AIRPORT_TRANSFER,
      source: TripSource.MANUAL,
      customerName: 'Priya Sharma',
      customerPhone: '+919812345678',
      pickupAddress: 'Hotel Taj, Bhopal',
      dropAddress: 'Raja Bhoj Airport, Bhopal',
      scheduledAt: tomorrow,
      paxCount: 2,
      luggageCount: 3,
      notes: 'VIP customer, handle with care',
    },
  });

  // Create status log for the draft
  await prisma.tripStatusLog.create({
    data: {
      tripId: trip1.id,
      toStatus: TripStatus.DRAFT,
      actorId: adminUser.id,
      actorRole: UserRole.ADMIN,
      notes: 'Trip created',
    },
  });

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(7, 0, 0, 0);

  const trip2 = await prisma.trip.create({
    data: {
      orgId: org.id,
      tripNumber: 'TRP-0002',
      status: TripStatus.CONFIRMED,
      serviceType: ServiceType.ONE_DAY,
      source: TripSource.MANUAL,
      customerName: 'Rahul Patel',
      customerPhone: '+919823456789',
      pickupAddress: 'DB City Mall, Bhopal',
      dropAddress: 'Sanchi Stupa, Sanchi',
      scheduledAt: dayAfter,
      paxCount: 4,
      luggageCount: 2,
    },
  });

  await prisma.tripStatusLog.createMany({
    data: [
      {
        tripId: trip2.id,
        toStatus: TripStatus.DRAFT,
        actorId: dispatcherUser.id,
        actorRole: UserRole.DISPATCHER,
        notes: 'Trip created',
      },
      {
        tripId: trip2.id,
        fromStatus: TripStatus.DRAFT,
        toStatus: TripStatus.CONFIRMED,
        actorId: dispatcherUser.id,
        actorRole: UserRole.DISPATCHER,
        notes: 'Customer confirmed booking',
      },
    ],
  });

  // Create pricing for trip2
  await prisma.tripPricing.create({
    data: {
      tripId: trip2.id,
      distanceKm: 46,
      estimatedFare: 2000,
      pricingRuleId: pricingRules[1].id,
    },
  });

  console.log(`Created ${2} sample trips`);

  // 11. WhatsApp templates
  await Promise.all([
    prisma.whatsAppTemplate.create({
      data: {
        orgId: org.id,
        name: 'trip_confirmation',
        body: 'Hello {{customer_name}}, your trip on {{date}} from {{pickup}} to {{drop}} is confirmed. Trip ID: {{trip_number}}',
        variables: ['customer_name', 'date', 'pickup', 'drop', 'trip_number'],
      },
    }),
    prisma.whatsAppTemplate.create({
      data: {
        orgId: org.id,
        name: 'driver_assigned',
        body: 'Hello {{driver_name}}, you have been assigned Trip {{trip_number}}. Pickup: {{pickup}} at {{time}}. Customer: {{customer_name}} ({{customer_phone}})',
        variables: ['driver_name', 'trip_number', 'pickup', 'time', 'customer_name', 'customer_phone'],
      },
    }),
    prisma.whatsAppTemplate.create({
      data: {
        orgId: org.id,
        name: 'sub_agency_assignment',
        body: 'New trip assigned to {{agency_name}}. Trip {{trip_number}} on {{date}}. Pickup: {{pickup}}, Drop: {{drop}}. Please accept from portal.',
        variables: ['agency_name', 'trip_number', 'date', 'pickup', 'drop'],
      },
    }),
  ]);
  console.log('Created WhatsApp templates');

  console.log('\nSeed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:      admin@tripbh.com / admin123');
  console.log('  Dispatcher: dispatch@tripbh.com / dispatch123');
  console.log('  Driver 1:   +919876543212 / driver123');
  console.log('  Driver 2:   +919876543213 / driver123');
  console.log('  Sub-Agency: star@travels.com / agency123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
