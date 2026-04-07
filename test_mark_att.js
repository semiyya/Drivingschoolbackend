import mongoose from "mongoose";
import Student from "./Model/student.js";
import Instructor from "./Model/instructor.js";
import User from "./Model/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/drivingschool").then(async () => {
    try {
        const student = await Student.findOne();
        if (!student) {
            console.log("No student found");
            process.exit(0);
        }

        const instructor = await Instructor.findOne({ _id: student.instructorId });
        if (!instructor) {
            console.log("No instructor for student");
            process.exit(0);
        }

        const user = await User.findById(instructor.userId);

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: "10d" }
        );

        console.log("Testing attendance for student:", student._id.toString());

        const res = await axios.post(`http://localhost:5000/api/attendance/${student._id.toString()}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Response:", res.data);
    } catch (e) {
        if (e.response) {
            console.log("Error Response:", e.response.status, e.response.data);
        } else {
            console.log("Error:", e.message);
        }
    }
    process.exit(0);
});
