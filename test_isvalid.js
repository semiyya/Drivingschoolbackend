import mongoose from "mongoose";

console.log("undefined:", mongoose.Types.ObjectId.isValid("undefined"));
console.log("[object Object]:", mongoose.Types.ObjectId.isValid("[object Object]"));
console.log("null:", mongoose.Types.ObjectId.isValid("null"));
