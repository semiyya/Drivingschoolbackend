import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  dob: Date,
  address: String,
  phone: String,
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor"
  },

  licenseType: {
    type: [String],
    enum: ["LMV", "HMV", "MCWG", "MCWOG"],
    required: true
  },




  totalClasses: {
    type: Number,
    default: 30
  },

  attendance: {
    type: Number,
    default: 0
  },

  extraClassesAllowed: {
    type: Number,
    default: 0
  },

  extraClassesUsed: {
    type: Number,
    default: 0
  },

  progressStatus: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started"
  },

  documents: [
    {
      documentName: String,
      fileBase64: String,
      verified: {
        type: Boolean,
        default: false
      }
    }
  ],

  // ✅ NEW FIELD
  isVerified: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for totalFee calculation
studentSchema.virtual('totalFee').get(function () {
  if (!this.licenseType || this.licenseType.length === 0) return 0;

  // Fee Logic:
  // HMV: 20000
  // LMV: 12000
  // MCWG/MCWOG: 8000

  if (this.licenseType.includes("HMV")) return 20000;
  if (this.licenseType.includes("LMV")) return 12000;
  if (this.licenseType.includes("MCWG") || this.licenseType.includes("MCWOG")) return 8000;

  return 0;
});

export default mongoose.model("Student", studentSchema);

