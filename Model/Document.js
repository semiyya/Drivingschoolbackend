
// import mongoose from "mongoose";

// const documentSchema = new mongoose.Schema({
//     studentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Student",
//         required: true
//     },
//     documentType: {
//         type: String,
//         enum: ["ID Proof"]
//     },
//     fileUrl: String,
//     verificationStatus: {
//         type: String,
//         enum: ["Pending", "Approved", "Rejected"],
//         default: "Pending"
//     },
//     verifiedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     }
// }, { timestamps: true });

// export default mongoose.model("Document", documentSchema);
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },

  documentType: {
    type: String,
    enum: ["ID Proof"],
    required: true
  },

  documentNumber: {
    type: String
  },

  documentUrl: {
    type: String
  },

  verified: {
    type: Boolean,
    default: false
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("Document", documentSchema);




