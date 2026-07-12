require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Vehicle = require("./models/Vehicle");
const Driver = require("./models/Driver");
const Trip = require("./models/Trip");

const seedUsers = [
  {
    name: 'Alok Fleet Manager',
    email: 'fleet@transitops.com',
    password: 'Password123',
    role: 'FleetManager',
  },
  {
    name: 'Arjav Dispatcher',
    email: 'dispatcher@transitops.com',
    password: 'Password123',
    role: 'Dispatcher',
  },
  {
    name: 'Gautam Safety Officer',
    email: 'safety@transitops.com',
    password: 'Password123',
    role: 'SafetyOfficer',
  },
  {
    name: 'Transit Operations Financial Analyst',
    email: 'analyst@transitops.com',
    password: 'Password123',
    role: 'FinancialAnalyst',
  }
];

const seedVehicles = [
  { registrationNo: 'VAN-05', name: 'Ford Transit VAN-05', type: 'Van', capacityKg: 1500, odometerKm: 45000, acquisitionCost: 35000, status: 'OnTrip' },
  { registrationNo: 'TRK-12', name: 'Volvo FH16 TRK-12', type: 'Truck', capacityKg: 20000, odometerKm: 120000, acquisitionCost: 110000, status: 'Available' },
  { registrationNo: 'MINI-08', name: 'Tata Ace MINI-08', type: 'Mini', capacityKg: 800, odometerKm: 15000, acquisitionCost: 12000, status: 'OnTrip' },
  { registrationNo: 'TRK-15', name: 'Scania R500 TRK-15', type: 'Truck', capacityKg: 22000, odometerKm: 85000, acquisitionCost: 125000, status: 'InShop' },
  { registrationNo: 'VAN-09', name: 'Mercedes Sprinter VAN-09', type: 'Van', capacityKg: 1800, odometerKm: 60000, acquisitionCost: 40000, status: 'Retired' },
  { registrationNo: 'FLT-02', name: 'Isuzu NPR Flatbed', type: 'Flatbed', capacityKg: 5000, odometerKm: 32000, acquisitionCost: 48000, status: 'Available' },
  { registrationNo: 'CNT-01', name: 'BharatBenz Container', type: 'Container', capacityKg: 15000, odometerKm: 98000, acquisitionCost: 85000, status: 'Available' }
];

const seedDrivers = [
  { name: 'Alex Mercer', licenseNo: 'DL-552918', licenseCategory: 'LMV', licenseExpiry: new Date('2028-12-31'), contact: '+1 (555) 019-2831', tripCompletionPct: 95, safetyScore: 98, status: 'OnTrip' },
  { name: 'John Doe', licenseNo: 'DL-902183', licenseCategory: 'HMV', licenseExpiry: new Date('2027-06-15'), contact: '+1 (555) 012-9988', tripCompletionPct: 88, safetyScore: 92, status: 'Available' },
  { name: 'Priya Sharma', licenseNo: 'DL-223190', licenseCategory: 'LMV', licenseExpiry: new Date('2029-03-20'), contact: '+91 98765 43210', tripCompletionPct: 97, safetyScore: 99, status: 'OnTrip' },
  { name: 'David Miller', licenseNo: 'DL-448192', licenseCategory: 'HMV', licenseExpiry: new Date('2026-11-30'), contact: '+1 (555) 017-4831', tripCompletionPct: 91, safetyScore: 85, status: 'OffDuty' },
  { name: 'Robert Chen', licenseNo: 'DL-112288', licenseCategory: 'HMV', licenseExpiry: new Date('2025-05-10'), contact: '+1 (555) 015-8811', tripCompletionPct: 75, safetyScore: 68, status: 'Suspended' }
];

const runSeed = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Clearing existing collections...");
    
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});

    console.log("Creating seed users...");
    for (const u of seedUsers) {
      await User.create(u);
    }
    console.log(`Created ${seedUsers.length} seed users.`);

    console.log("Creating seed vehicles...");
    const createdVehicles = [];
    for (const v of seedVehicles) {
      const created = await Vehicle.create(v);
      createdVehicles.push(created);
    }
    console.log(`Created ${createdVehicles.length} vehicles.`);

    console.log("Creating seed drivers...");
    const createdDrivers = [];
    for (const d of seedDrivers) {
      const created = await Driver.create(d);
      createdDrivers.push(created);
    }
    console.log(`Created ${createdDrivers.length} drivers.`);

    // Find indices for referencing
    const van = createdVehicles.find(v => v.registrationNo === 'VAN-05');
    const trk = createdVehicles.find(v => v.registrationNo === 'TRK-12');
    const mini = createdVehicles.find(v => v.registrationNo === 'MINI-08');

    const alex = createdDrivers.find(d => d.name === 'Alex Mercer');
    const john = createdDrivers.find(d => d.name === 'John Doe');
    const priya = createdDrivers.find(d => d.name === 'Priya Sharma');

    const seedTrips = [
      {
        tripId: 'TR001',
        source: 'Depot Alpha',
        destination: 'Sector 4 Distribution',
        vehicleId: van ? van._id : null,
        driverId: alex ? alex._id : null,
        cargoWeightKg: 1200,
        plannedDistanceKm: 45,
        status: 'Dispatched'
      },
      {
        tripId: 'TR002',
        source: 'Depot Alpha',
        destination: 'West Warehouse',
        vehicleId: trk ? trk._id : null,
        driverId: john ? john._id : null,
        cargoWeightKg: 15000,
        plannedDistanceKm: 180,
        status: 'Completed',
        completedAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
      },
      {
        tripId: 'TR003',
        source: 'Depot Alpha',
        destination: 'North Terminal',
        vehicleId: mini ? mini._id : null,
        driverId: priya ? priya._id : null,
        cargoWeightKg: 650,
        plannedDistanceKm: 15,
        status: 'Dispatched'
      },
      {
        tripId: 'TR004',
        source: 'West Warehouse',
        destination: 'South Depot',
        vehicleId: null,
        driverId: null,
        cargoWeightKg: 9500,
        plannedDistanceKm: 310,
        status: 'Draft'
      }
    ];

    console.log("Creating seed trips...");
    for (const t of seedTrips) {
      await Trip.create(t);
    }
    console.log("Seed trips created successfully.");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
