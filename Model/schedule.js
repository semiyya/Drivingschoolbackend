
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    startTime: {
      type: String, // HH:mm
      required: true
    },

    endTime: {
      type: String, // HH:mm
      required: true
    },

    type: {
      type: String,
      enum: ["ROAD_PRACTICE", "GROUND_PRACTICE"],
      required: true
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    }
  },
  {
    timestamps: true // createdAt & updatedAt
  }
);

// Optional but recommended for faster conflict queries
scheduleSchema.index({ date: 1, startTime: 1, endTime: 1 });

export default mongoose.model("Schedule", scheduleSchema);







