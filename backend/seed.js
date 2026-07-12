require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedUsers = [];

const runSeed = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Clearing existing users...");
    await User.deleteMany({});

    if (seedUsers.length === 0) {
      console.log(
        "No demo users configured. Use the register page to create accounts.",
      );
    } else {
      console.log("Creating users...");
      for (const u of seedUsers) {
        await User.create(u);
        console.log(`Created user: ${u.name} [${u.role}]`);
      }
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
