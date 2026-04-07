
import mongoose from "mongoose";
import dotenv from "dotenv";
import DrivingTest from "./Model/drivingtest.js";
import Student from "./Model/student.js";
import User from "./Model/User.js";

dotenv.config();

mongoose.connect(process.env.DB_URL || "mongodb://127.0.0.1:27017/DrivingSchool")
    .then(async () => {
        console.log("Connected to DB");

        console.log("\n--- Checking Driving Tests ---");
        const tests = await DrivingTest.find().populate('student');

        if (tests.length === 0) {
            console.log("No Driving Tests found in database.");
        } else {
            tests.forEach(test => {
                console.log(`DrivingTest ID: ${test._id}`);
                console.log(`  Student ID: ${test.student?._id || test.student}`); // Handle populated or raw
                console.log(`  Student Name: ${test.student?.name || 'Unknown'}`);
                console.log(`  Status: ${test.status}`);
                console.log(`  Tests: ${JSON.stringify(test.tests)}`);
                console.log("-------------------------------------------------");
            });
        }

        console.log("\n--- Valid Student IDs to try ---");
        // Just list first 5 students
        const students = await Student.find().limit(5);
        students.forEach(s => {
            console.log(`Student: ${s.name} (ID: ${s._id})`);
        });

        process.exit();
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
