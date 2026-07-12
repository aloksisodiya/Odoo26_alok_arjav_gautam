require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = [
  {
    name: 'Alok Fleet Manager',
    email: 'fleet@transitops.com',
    password: 'Password123',
    role: 'FleetManager',
    failedLoginAttempts: 0,
    lockedUntil: null
  },
  {
    name: 'Arjav Dispatcher',
    email: 'dispatcher@transitops.com',
    password: 'Password123',
    role: 'Dispatcher',
    failedLoginAttempts: 0,
    lockedUntil: null
  },
  {
    name: 'Gautam Safety Officer',
    email: 'safety@transitops.com',
    password: 'Password123',
    role: 'SafetyOfficer',
    failedLoginAttempts: 0,
    lockedUntil: null
  },
  {
    name: 'Transit Operations Financial Analyst',
    email: 'analyst@transitops.com',
    password: 'Password123',
    role: 'FinancialAnalyst',
    failedLoginAttempts: 0,
    lockedUntil: null
  }
];

const runSeed = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Clearing existing users...');
    await User.deleteMany({});
    
    console.log('Creating users...');
    for (const u of seedUsers) {
      await User.create(u);
      console.log(`Created user: ${u.name} [${u.role}]`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
