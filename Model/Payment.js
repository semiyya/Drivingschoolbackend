
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  amount: Number,
  paymentMode: {
    type: String,
    enum: ["Cash", "Online"]
  },
  status: {
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending"
  },
  receiptNumber: String,
  paymentDate: Date
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
