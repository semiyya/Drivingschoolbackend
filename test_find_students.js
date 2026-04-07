import mongoose from "mongoose";
import Student from "./Model/student.js";
import Instructor from "./Model/instructor.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect("mongodb://127.0.0.1:27017/DrivingSchool").then(async () => {
    try {
        const students = await Student.find({});
        console.log(`Found ${students.length} students total.`);

        students.forEach((s, i) => {
            console.log(`Student ${i}: _id=${s._id}, name=${s.name}, instructorId=${s.instructorId}`);
        });

        const instructors = await Instructor.find({});
        console.log(`Found ${instructors.length} instructors total.`);
        instructors.forEach((inst, i) => {
            console.log(`Instructor ${i}: _id=${inst._id}, name=${inst.name}`);
        });

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
