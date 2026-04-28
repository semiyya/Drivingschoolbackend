// import mongoose from "mongoose";
// export default async function connection() {
//     // const db= await mongoose.connect('mongodb://127.0.0.1:27017/DrivingSchool')
//     const db= await  mongoose.connect(process.env.MONGO_URI)  
//     console.log("database created")
//     return db
    
// }
import mongoose from "mongoose";

export default async function connection() {
    if (!process.env.MONGO_URI) {
        console.log("❌ MONGO_URI missing");
        process.exit(1);
    }

    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ database connected");
    return db;
}
