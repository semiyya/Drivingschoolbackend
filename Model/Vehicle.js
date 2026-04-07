
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  model: String,
  type: {
    type: String,
    enum: ["LMV", "HMV", "Two-wheeler", "Other"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Available", "Maintenance", "Disabled"],
    default: "Available"
  },
  image: {
    type: String,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);
