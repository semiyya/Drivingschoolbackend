import mongoose from "mongoose";
import User from "./Model/User.js";
import Student from "./Model/student.js";
import bcrypt from "bcrypt";

async function verifyRegistryAndStats() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/DrivingSchool');
        console.log("Connected to MongoDB");

        // 1. Check if the test student exists (from previous browser attempt or create one)
        let testStudent = await User.findOne({ email: "finalnotif@gmail.com" });
        if (!testStudent) {
            console.log("Creating test student...");
            const hashedPassword = await bcrypt.hash("password123", 10);
            testStudent = await User.create({
                name: "Final Notif Student",
                email: "finalnotif@gmail.com",
                password: hashedPassword,
                role: "student"
            });
            await Student.create({
                userId: testStudent._id,
                name: testStudent.name,
                dob: new Date("1998-10-10"),
                address: "Final Testing Blvd",
                phone: "1112223333",
                licenseType: ["LMV", "HMV"]
            });
        }

        // 2. Fetch Unverified Students
        const unverified = await Student.find({ isVerified: false }).populate("userId", "name email");
        console.log("UNVERIFIED_COUNT:" + unverified.length);
        console.log("UNVERIFIED_LIST:" + JSON.stringify(unverified.map(s => s.name)));

        // 3. Verify specifically for our test student
        const isPresent = unverified.some(s => s.userId.email === "finalnotif@gmail.com");
        console.log("TEST_STUDENT_IN_NOTIF:" + isPresent);

        // 4. Test Verification Logic (Simulate the update)
        if (isPresent) {
            const studentToVerify = unverified.find(s => s.userId.email === "finalnotif@gmail.com");
            studentToVerify.isVerified = true;
            await studentToVerify.save();
            console.log("VERIFICATION_SUCCESS:finalnotif@gmail.com");
        }

        // 5. Re-check count
        const newUnverified = await Student.countDocuments({ isVerified: false });
        console.log("NEW_UNVERIFIED_COUNT:" + newUnverified);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyRegistryAndStats();
