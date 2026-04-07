import mongoose from "mongoose";
import User from "./Model/User.js";
import Student from "./Model/student.js";
import Schedule from "./Model/schedule.js";
import Payment from "./Model/Payment.js";
import Instructor from "./Model/instructor.js";

async function testStats() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DrivingSchool');
        console.log("Connected to MongoDB");

        const totalStudents = await Student.countDocuments();
        const activeInstructors = await Instructor.countDocuments({ isAvailable: true });
        const pendingPayments = await Payment.countDocuments({ status: "Pending" });
        const today = new Date().toISOString().split("T")[0];
        const todaySchedules = await Schedule.countDocuments({ date: today });
        const unverifiedStudents = await Student.countDocuments({ isVerified: false });

        console.log("STATS_RESULT:" + JSON.stringify({
            totalStudents,
            activeInstructors,
            pendingPayments,
            todaySchedules,
            unverifiedStudents
        }));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testStats();
