
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./Model/User.js";

async function addAdmin() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/DrivingSchool');
    console.log("Connected to MongoDB...");

    const adminEmail = "admin123@gmail.com";
    const adminPassword = "123admin";
    const adminName = "System Admin";

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists. Updating password...`);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin"; // Ensure role is correct
      await existingAdmin.save();
      console.log("Admin account updated successfully.");
    } else {
      // 4. Create new admin account
      console.log(`Creating new admin account with email ${adminEmail}...`);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true
      });
      console.log("Admin account created successfully.");
    }

  } catch (error) {
    console.error("Error adding admin:", error);
  } finally {
    // 5. Disconnect
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

addAdmin();
