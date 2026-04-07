import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // 🔗 Student reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    // 📅 Attendance date
    date: {
      type: Date,
      default: Date.now
    },

    // 🟢 / 🔴 Status
    status: {
      type: String,
      enum: ["Present", "Absent"],
      default: "Present"
    },

    // 📘 Class or Test
    classType: {
      type: String,
      enum: ["CLASS", "TEST"],
      default: "CLASS"
    },

    // 📊 SINGLE SUMMARY SNAPSHOT (latest used in UI)
    summary: {
      totalClasses: {
        type: Number
      },
      attendance: {
        type: Number
      },
      extraClassesAllowed: {
        type: Number
      },
      extraClassesUsed: {
        type: Number
      },
      progressStatus: {
        type: String,
        enum: ["Not Started", "In Progress", "Completed"]
      }
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

export default mongoose.model("Attendance", attendanceSchema);
