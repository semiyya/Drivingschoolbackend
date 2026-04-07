import mongoose from "mongoose";
import Student from "./Model/student.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {}).then(async () => {
    // get a student
    const student = await Student.findOne();
    if (student) {
        const obj = student.toObject();
        console.log("_id in toObject():", obj._id);
        console.log("spread object:", { ...obj });
    }
    process.exit(0);
});
