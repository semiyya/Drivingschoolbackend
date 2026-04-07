import mongoose from "mongoose";
import User from "./Model/User.js";

async function findAdmin() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DrivingSchool');
        console.log("Connected to MongoDB");
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log("ADMIN_EMAIL:" + admin.email);
        } else {
            console.log("NO_ADMIN_FOUND");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

findAdmin();
