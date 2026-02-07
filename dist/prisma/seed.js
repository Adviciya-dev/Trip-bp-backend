"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
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
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
        data: {
            orgId: org.id,
            name: 'Admin User',
            email: 'admin@tripbh.com',
            phone: '+919876543210',
            passwordHash: adminPasswordHash,
            role: client_1.UserRole.ADMIN,
        },
    });
    console.log(`Created admin: ${adminUser.name}`);
    const dispatcherPasswordHash = await bcrypt.hash('dispatch123', 10);
    const dispatcherUser = await prisma.user.create({
        data: {
            orgId: org.id,
            name: 'Dispatch Ops',
            email: 'dispatch@tripbh.com',
            phone: '+919876543211',
            passwordHash: dispatcherPasswordHash,
            role: client_1.UserRole.DISPATCHER,
        },
    });
    console.log(`Created dispatcher: ${dispatcherUser.name}`);
    const driverPasswordHash = await bcrypt.hash('driver123', 10);
    const driverUser1 = await prisma.user.create({
        data: {
            orgId: org.id,
            name: 'Rajesh Kumar',
            phone: '+919876543212',
            passwordHash: driverPasswordHash,
            role: client_1.UserRole.DRIVER,
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
            role: client_1.UserRole.DRIVER,
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
    const subAgencyUser = await prisma.user.create({
        data: {
            orgId: org.id,
            name: 'Star Travels Manager',
            email: 'star@travels.com',
            phone: '+919876543214',
            passwordHash: await bcrypt.hash('agency123', 10),
            role: client_1.UserRole.SUB_AGENCY_USER,
        },
    });
    const subAgency = await prisma.subAgency.create({
        data: {
            orgId: org.id,
            name: 'Star Travels',
            contactPerson: 'Amit Shah',
            phone: '+919876543214',
            email: 'star@travels.com',
            servicesAllowed: [client_1.ServiceType.AIRPORT_TRANSFER, client_1.ServiceType.ONE_DAY],
            settlementCycle: 'MONTHLY',
        },
    });
    await prisma.user.update({
        where: { id: subAgencyUser.id },
        data: { subAgencyId: subAgency.id },
    });
    console.log(`Created sub-agency: ${subAgency.name}`);
    const pricingRules = await Promise.all([
        prisma.pricingRule.create({
            data: {
                orgId: org.id,
                serviceType: client_1.ServiceType.AIRPORT_TRANSFER,
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
                serviceType: client_1.ServiceType.ONE_DAY,
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
                serviceType: client_1.ServiceType.MULTI_DAY,
                ratePerKm: 10,
                minFare: 3500,
                includedKm: 200,
                extraKmRate: 12,
                effectiveFrom: new Date('2024-01-01'),
            },
        }),
    ]);
    console.log(`Created ${pricingRules.length} pricing rules`);
    const commissionRule = await prisma.commissionRule.create({
        data: {
            orgId: org.id,
            subAgencyId: subAgency.id,
            commissionType: client_1.CommissionType.PERCENTAGE,
            value: 15,
            commissionBase: client_1.CommissionBase.FINAL_FARE,
        },
    });
    console.log(`Created commission rule: ${commissionRule.value}% for ${subAgency.name}`);
    await Promise.all([
        prisma.orgServiceType.create({
            data: { orgId: org.id, serviceType: client_1.ServiceType.AIRPORT_TRANSFER, label: 'Airport Transfer' },
        }),
        prisma.orgServiceType.create({
            data: { orgId: org.id, serviceType: client_1.ServiceType.ONE_DAY, label: 'One Day Trip' },
        }),
        prisma.orgServiceType.create({
            data: { orgId: org.id, serviceType: client_1.ServiceType.MULTI_DAY, label: 'Multi Day Trip' },
        }),
    ]);
    console.log('Created service type configs');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const trip1 = await prisma.trip.create({
        data: {
            orgId: org.id,
            tripNumber: 'TRP-0001',
            status: client_1.TripStatus.DRAFT,
            serviceType: client_1.ServiceType.AIRPORT_TRANSFER,
            source: client_1.TripSource.MANUAL,
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
    await prisma.tripStatusLog.create({
        data: {
            tripId: trip1.id,
            toStatus: client_1.TripStatus.DRAFT,
            actorId: adminUser.id,
            actorRole: client_1.UserRole.ADMIN,
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
            status: client_1.TripStatus.CONFIRMED,
            serviceType: client_1.ServiceType.ONE_DAY,
            source: client_1.TripSource.MANUAL,
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
                toStatus: client_1.TripStatus.DRAFT,
                actorId: dispatcherUser.id,
                actorRole: client_1.UserRole.DISPATCHER,
                notes: 'Trip created',
            },
            {
                tripId: trip2.id,
                fromStatus: client_1.TripStatus.DRAFT,
                toStatus: client_1.TripStatus.CONFIRMED,
                actorId: dispatcherUser.id,
                actorRole: client_1.UserRole.DISPATCHER,
                notes: 'Customer confirmed booking',
            },
        ],
    });
    await prisma.tripPricing.create({
        data: {
            tripId: trip2.id,
            distanceKm: 46,
            estimatedFare: 2000,
            pricingRuleId: pricingRules[1].id,
        },
    });
    console.log(`Created ${2} sample trips`);
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
//# sourceMappingURL=seed.js.map