import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name:
  {
    type: mongoose.Schema.Types.String,
    ref: "User"
  },

  phone: String,
  experience: Number,
  licenseNumber: String,
  license: String, // Type of license e.g. "Government Approved"
  about: String,
  image: String, // Base64 string for instructor photo
  trainingCertificate: String, // Base64 string for instructor training certificate

  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  maxStudents: {
    type: Number,
    default: 3
  },

  currentStudents: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["pending", "active", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Instructor", instructorSchema);
