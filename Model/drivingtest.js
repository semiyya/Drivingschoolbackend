import mongoose from "mongoose";

const vehicleTestSchema = new mongoose.Schema({
  vehicleType:
  {
    type: String,
    enum: ["LMV", "HMV", "MCWG", "MCWOG", "CAR", "BIKE"],
    required: true
  },


  result: {
    type: String,
    enum: ["PENDING", "PASS", "FAIL", "RE-TEST", "Pending"],
    default: "PENDING"
  },
  remarks: String
});

const drivingTestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true // 🔥 one test record per student
    },

    testDate: {
      type: Date,
      required: false
    },
    learnersTestDate: {
      type: Date
    },
    learnersTestResult: {
      type: String,
      enum: ["PENDING", "PASS", "FAIL"],
      default: "PENDING"
    },
    learnersTestRemarks: {
      type: String
    },

    tests: [vehicleTestSchema],

    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

export default mongoose.model("DrivingTest", drivingTestSchema);
