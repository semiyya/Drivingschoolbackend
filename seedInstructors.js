import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import User from "./Model/User.js";
import Instructor from "./Model/Instructor.js";
import connection from "./Connection.js";

const seedData = async () => {
    try {
        await connection();
        console.log("Connected to database...");

        const frontendPublicPath = path.resolve("../Frontend/public/images");

        const getBase64 = (fileName) => {
            const filePath = path.join(frontendPublicPath, fileName);
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath);
                return `data:image/jpeg;base64,${fileData.toString("base64")}`;
            }
            return "";
        };

        const instructorsData = [
            {
                name: "Rahul Kumar",
                email: "rahul@expert.com",
                phone: "+91 9876543210",
                experience: 10,
                licenseNumber: "DL-RK-10023",
                license: "LMV & HMV Certified",
                about: "Rahul has trained over 500+ successful students and specializes in defensive driving, highway driving, and test preparation.",
                image: getBase64("team-2.jpg")
            },
            {
                name: "Anil Joseph",
                email: "anil@expert.com",
                phone: "+91 9123456780",
                experience: 7,
                licenseNumber: "DL-AJ-88219",
                license: "Government Approved Instructor",
                about: "Anil focuses on beginners and nervous drivers, ensuring confidence building and safe driving practices.",
                image: getBase64("team-4.jpg")
            }
        ];

        for (const inst of instructorsData) {
            // Check if user exists
            let user = await User.findOne({ email: inst.email });
            if (!user) {
                const hashedPassword = await bcrypt.hash("password123", 10);
                user = await User.create({
                    name: inst.name,
                    email: inst.email,
                    password: hashedPassword,
                    role: "instructor"
                });
                console.log(`User created for ${inst.name}`);
            }

            // Check if instructor profile exists
            let profile = await Instructor.findOne({ userId: user._id });
            if (!profile) {
                await Instructor.create({
                    userId: user._id,
                    name: inst.name,
                    phone: inst.phone,
                    experience: inst.experience,
                    licenseNumber: inst.licenseNumber,
                    license: inst.license,
                    about: inst.about,
                    image: inst.image,
                    maxStudents: 5
                });
                console.log(`Instructor profile created for ${inst.name}`);
            } else {
                console.log(`Instructor profile already exists for ${inst.name}, updating...`);
                profile.image = inst.image;
                profile.about = inst.about;
                profile.license = inst.license;
                profile.experience = inst.experience;
                profile.phone = inst.phone;
                await profile.save();
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedData();

