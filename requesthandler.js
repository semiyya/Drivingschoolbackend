
import User from "./Model/User.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import StudyMaterial from "./Model/Studymaterial.js";
import Document from "./Model/Document.js";
import Student from "./Model/student.js";
import Instructor from "./Model/Instructor.js";
import Vehicle from "./Model/Vehicle.js";
import Schedule from "./Model/schedule.js";
import DrivingTest from "./Model/drivingtest.js";
import Payment from "./Model/Payment.js";
import Attendance from "./Model/Attendance.js";
import Contact from "./Model/Contact.js";
import Notification from "./Model/Notification.js";
import nodemailer from "nodemailer";

import mongoose from "mongoose";

// Helper to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export async function testHandler(req, res) {
  try {
    res.status(200).json({ msg: "Server is working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// export async function aboutHandler(req, res) {
//   try {
//     res.status(200).json({ msg: "About page is working!" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }


// ----------------------------------------
// 📩 CREATE CONTACT (Public)
// POST /api/contact
// ----------------------------------------
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newContact,
    });

  } catch (error) {
    console.error("Create Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ----------------------------------------
// 📋 GET ALL CONTACTS (Admin)
// GET /api/contact
// ----------------------------------------
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });

  } catch (error) {
    console.error("Get Contacts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
};


// ----------------------------------------
// 📄 GET SINGLE CONTACT (Admin)
// GET /api/contact/:id
// ----------------------------------------
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });

  } catch (error) {
    console.error("Get Single Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ----------------------------------------
// 📧 SEND REPLY (Admin)
// POST /api/contact/reply/:id
// ----------------------------------------
export const sendReply = async (req, res) => {
  try {
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: "Reply from Driving School",
      html: `
        <h3>Hello ${contact.name},</h3>
        <p>${replyMessage}</p>
        <br/>
        <p><strong>Best Regards,</strong><br/>Driving School Team</p>
      `,
    });

    // Update DB
    contact.reply = replyMessage;
    contact.replied = true;
    await contact.save();

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });

  } catch (error) {
    console.error("Detailed Send Reply Error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
    });
    res.status(500).json({
      success: false,
      message: error.message || "Error sending reply email",
    });
  }
};


// ----------------------------------------
// 🗑 DELETE CONTACT (Admin)
// DELETE /api/contact/:id
// ----------------------------------------
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });

  } catch (error) {
    console.error("Delete Contact Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/* ---------------REGISTER----------------*/
export async function register(req, res) {

  try {
    const {
      name, email, password, cpassword, role,
      dob, address, phone, licenseType, idProof1, idProof2,
      experience, licenseNumber, license, about, image, trainingCertificate
    } = req.body;

    if (!name || !email || !password || !cpassword || !role) {
      return res.status(400).json({
        msg: "Please provide all required fields"
      });
    }
    if (password !== cpassword) {
      return res.status(400).json({
        msg: "Passwords do not match"
      });
    }

    // 🔞 Age Validation for Students
    if (role === "student") {
      if (!dob) {
        return res.status(400).json({ message: "Date of Birth is required for students" });
      }
      if (calculateAge(dob) < 18) {
        return res.status(400).json({ message: "Registration failed: Student must be at least 18 years old." });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: "User with this email already exists"
      });
    }

    // 🔐 Allow ONLY ONE admin
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });

      if (adminExists) {
        return res.status(403).json({
          message: "Admin already exists. Only one admin is allowed."
        });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // ✅ If student, create profile automatically
    if (role === 'student') {
      try {
        await Student.create({
          userId: user._id,
          name: user.name, // Copy name for convenience
          dob,
          address,
          phone,
          licenseType: licenseType || [],
          documents: [
            ...(idProof1 ? [{ documentName: "Identity Proof 1", fileBase64: idProof1, verified: false }] : []),
            ...(idProof2 ? [{ documentName: "Identity Proof 2", fileBase64: idProof2, verified: false }] : [])
          ]
        });
      } catch (profileError) {
        console.error("Student Profile Auto-Creation Error:", profileError);
      }
    }

    // ✅ If instructor, create PENDING profile automatically
    if (role === 'instructor') {
      try {
        await Instructor.create({
          userId: user._id,
          name: user.name,
          phone,
          experience,
          licenseNumber,
          license,
          about,
          image,
          trainingCertificate,
          status: "pending"
        });
      } catch (profileError) {
        console.error("Instructor Profile Auto-Creation Error:", profileError);
      }
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Server error"
    });
  }
}

/* -------LOGIN*---------*/

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    // Secure login: generic error message and constant time comparison checks
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ msg: "Server Configuration Error" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secret,
      { expiresIn: "7d" }
    );

    // ✅ Verification check based on role
    if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student && !student.isVerified) {
        return res.status(403).json({ msg: "Your registration is pending admin verification. Please try again later." });
      }
    } else if (user.role === "instructor") {
      const instructor = await Instructor.findOne({ userId: user._id });
      if (instructor && instructor.status === "pending") {
        return res.status(403).json({ msg: "Your instructor profile is pending admin approval. Please try again later." });
      }
    }

    res.status(200).json({
      msg: "Login successful",
      token,
      role: user.role,
      userId: user._id
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
}



export const uploadStudyMaterial = async (req, res) => {
  try {
    const { title, description, contentUrl } = req.body;

    // contentUrl can now be a Base64 string from the frontend
    const material = await StudyMaterial.create({
      title,
      description,
      contentUrl,
      uploadedBy: req.user.userId   // from JWT
    });

    res.status(201).json({
      message: "Study material uploaded successfully",
      material
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().populate("uploadedBy", "name email");
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteStudyMaterial = async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const uploadDocument = async (req, res) => {
  try {
    const { documentType, documentNumber, documentUrl } = req.body;

    // Find student profile by userId from token
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found. Please create profile first." });
    }

    const document = await Document.create({
      student: student._id,
      documentType,
      documentNumber,
      documentUrl
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.verified = true;
    document.verifiedBy = req.user.userId; // 🛡️ Use userId

    await document.save();

    res.json({
      message: "Document verified successfully",
      document
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocumentsByStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    const documents = await Document.find({ student: userId });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ---------------- STUDENT CRUD ---------------- */
export const createStudent = async (req, res) => {
  try {
    const { userId, dob, address, phone, licenseType } = req.body;

    if (!userId || !licenseType) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    // 🔞 Age Validation
    if (dob && calculateAge(dob) < 18) {
      return res.status(400).json({ message: "Cannot create profile: Student must be at least 18 years old." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role !== "student") {
      return res.status(400).json({ msg: "This user is not registered as a student" });
    }

    const existingProfile = await Student.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ msg: "Student profile already exists for this user" });
    }

    const student = await Student.create({
      userId,
      name: user.name, // Copy name for convenience
      email: user.email, // Copy email for convenience
      dob,
      address,
      phone,
      licenseType
    });

    res.status(201).json({
      message: "Student profile created successfully",
      student
    });
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({ msg: "Server error while creating student" });
  }
};

export const getUnprofiledStudents = async (req, res) => {
  try {
    // 1️⃣ Find all users with role 'student'
    const studentUsers = await User.find({ role: "student" });

    // 2️⃣ Find all existing student profile userIds
    const profiledUserIds = await Student.find().distinct("userId");

    // 3️⃣ Filter out users who already have a profile
    const availableUsers = studentUsers.filter(user =>
      !profiledUserIds.some(id => id.toString() === user._id.toString())
    );

    res.json(availableUsers);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching available users" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("instructorId").populate("userId", "name email"); // Populate userId for name

    // Fetch all active driving tests
    const drivingTests = await DrivingTest.find({ status: "ACTIVE" });

    // Create a map of studentId -> eligibility status
    const eligibilityMap = {};
    drivingTests.forEach(test => {
      const allPassed = test.tests.length > 0 && test.tests.every(t => t.result === "PASS");
      eligibilityMap[test.student.toString()] = allPassed;
    });

    // Attach eligibility to student objects
    const studentsWithEligibility = students.map(student => {
      const isEligible = eligibilityMap[student._id.toString()] || false;
      return {
        ...student.toObject(),
        isEligibleForLicense: isEligible,
        eligibilityMessage: isEligible ? "Eligible" : "Not Eligible"
      };
    });

    res.json(studentsWithEligibility);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("instructorId")
      .populate("userId", "name email");

    if (!student) {
      console.warn(`[getStudentById] Student not found: ${req.params.id}`);
      return res.status(404).json({ msg: "Student not found" });
    }

    console.log(`[getStudentById] Successfully fetched student: ${student.name || student._id}`);
    console.log(`[getStudentById] Instructor assigned: ${student.instructorId ? student.instructorId._id : 'NONE'}`);

    res.json(student);
  } catch (error) {
    console.error(`[getStudentById Error] ${req.params.id}:`, error);
    res.status(500).json({ msg: "Error fetching student details" });
  }
};

export const updateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(student);
};

export const deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ msg: "Student deleted" });
};

/**
 * ❌ Reject Student Registration (Admin)
 */
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Delete associated User record
    await User.findByIdAndDelete(student.userId);

    // Delete Student profile
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Student registration rejected and account deleted successfully"
    });
  } catch (error) {
    console.error("[rejectStudent Error]:", error);
    res.status(500).json({ error: "Failed to reject student registration" });
  }
};

/* ---------------- ATTENDANCE ---------------- */
// export const markAttendance = async (req, res) => {
//   const student = await Student.findById(req.params.id);

//   if (student.attendance >= student.totalClasses) {
//     return res.status(400).json({ msg: "Classes completed. Extra payment required" });
//   }

//   student.attendance += 1;
//   student.progressStatus =
//     student.attendance === student.totalClasses
//       ? "Completed"
//       : "In Progress";

//   await student.save();
//   res.json(student);
// };

// export const getAttendance = async (req, res) => {
//   const student = await Student.findById(req.params.id);
//   res.json(student.attendance);
// };

// export const addExtraClasses = async (req, res) => {
//   const student = await Student.findById(req.params.id);
//   student.extraClassesAllowed += req.body.extraClassesAllowed
//   student.totalClasses += req.body.extraClassesAllowed;

//   await student.save();

//   res.json({ msg: "Extra classes added", student });
// };



/**
 * ✅ Mark Attendance (Option 3 – Summary snapshot)
 */
export const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`\n\n[markAttendance] --- START --- `);
    console.log(`[markAttendance] req.params.id received: "${id}" (typeof ${typeof id})`);

    // 0️⃣ Validate ObjectId to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`[markAttendance] Invalid ID format: ${id}`);
      return res.status(400).json({ msg: "Invalid ID format provided" });
    }

    // 🤔 Test lookup explicitly
    let studentById = await Student.findById(id);
    let studentByUserId = await Student.findOne({ userId: id });
    console.log(`[markAttendance] studentById test: ${studentById ? "FOUND" : "NOT FOUND"}`);
    console.log(`[markAttendance] studentByUserId test: ${studentByUserId ? "FOUND" : "NOT FOUND"}`);

    // 1️⃣ Student check (flexible: search by student _id OR userId)
    let student = await Student.findById(id);
    if (!student) {
      student = await Student.findOne({ userId: id });
    }

    if (!student) {
      console.error(`[markAttendance ERROR] Student not found with ID: ${id}`);
      return res.status(404).json({ msg: "Student not found" });
    }

    console.log(`[markAttendance] Student found: ${student._id}`);

    // 1.5️⃣ Prevent duplicate attendance for the same day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      student: student._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingAttendance) {
      return res.status(400).json({ msg: "Attendance already marked for this student today" });
    }

    // 2️⃣ Extra class logic
    if (student.attendance >= student.totalClasses) {
      if (student.extraClassesUsed >= student.extraClassesAllowed) {
        return res.status(400).json({
          msg: "Classes completed. Extra payment required"
        });
      }
      student.extraClassesUsed += 1;
    }

    // 3️⃣ Update attendance count
    student.attendance += 1;

    // 4️⃣ Progress status
    if (student.attendance === 0) {
      student.progressStatus = "Not Started";
    } else if (student.attendance < student.totalClasses) {
      student.progressStatus = "In Progress";
    } else {
      student.progressStatus = "Completed";
    }

    await student.save();

    // 5️⃣ Save attendance history + summary snapshot
    const attendance = await Attendance.create({
      student: student._id,
      status: "Present",
      summary: {
        totalClasses: student.totalClasses,
        attendance: student.attendance,
        extraClassesAllowed: student.extraClassesAllowed,
        extraClassesUsed: student.extraClassesUsed,
        progressStatus: student.progressStatus
      }
    });

    res.json({
      msg: "Attendance marked",
      attendance
    });

  } catch (error) {
    console.error("[markAttendance Error]:", error);
    res.status(500).json({ msg: "Server error while marking attendance" });
  }
};

/**
 * 📅 Get Attendance History (Student)
 */
export const getAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    // 0️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID format" });
    }

    // 1️⃣ Find the student _id first (might be userId)
    const student = await Student.findOne({ $or: [{ _id: id }, { userId: id }] });

    if (!student) {
      return res.status(404).json({ msg: "Student profile not found" });
    }

    const records = await Attendance.find({ student: student._id })
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching attendance" });
  }
};

/**
 * 📅 Get All Attendance Records (Admin)
 */
export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    console.error("[getAllAttendance Error]:", error);
    res.status(500).json({ msg: "Error fetching all attendance records" });
  }
};

/**
 * 💾 Update Attendance Record (Admin)
 */
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, classType, date, summary } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid attendance ID" });
    }

    const updatedRecord = await Attendance.findByIdAndUpdate(
      id,
      { status, classType, date, summary },
      { new: true }
    ).populate({
      path: "student",
      populate: { path: "userId", select: "name" }
    });

    if (!updatedRecord) {
      return res.status(404).json({ msg: "Attendance record not found" });
    }

    res.status(200).json({
      message: "Attendance updated successfully",
      record: updatedRecord
    });
  } catch (error) {
    console.error("[updateAttendance Error]:", error);
    res.status(500).json({ msg: "Error updating attendance record" });
  }
};

/**
 * ➕ Add Extra Classes
 */
export const addExtraClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const { extraClassesAllowed } = req.body;

    // 0️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid ID format" });
    }

    const student = await Student.findOne({ $or: [{ _id: id }, { userId: id }] });
    if (!student) {
      return res.status(404).json({ msg: "Student profile not found" });
    }

    student.extraClassesAllowed += Number(extraClassesAllowed);
    student.totalClasses += Number(extraClassesAllowed);

    await student.save();

    res.json({
      msg: "Extra classes added successfully",
      student
    });

  } catch (error) {
    res.status(500).json({ msg: "Error adding extra classes" });
  }
};




/* ---------------- INSTRUCTOR ---------------- */
// export const createInstructor = async (req, res) => {
//   const instructor = await Instructor.create(req.body);
//   res.status(201).json(instructor);
// };

// export const getInstructors = async (req, res) => {
//   const instructors = await Instructor.find();
//   res.json(instructors);
// };


// /* ---------------- ASSIGN INSTRUCTOR ---------------- */
// export const assignInstructorToStudent = async (req, res) => {
//   const { instructorId } = req.body;

//   const instructor = await Instructor.findById(instructorId);
//   if (!instructor || !instructor.isAvailable)
//     return res.status(400).json({ msg: "Instructor unavailable" });

//   const count = await Student.countDocuments({ instructorId });

//   if (count >= instructor.maxStudents) {
//     instructor.isAvailable = false;
//     await instructor.save();
//     return res.status(400).json({ msg: "Instructor limit reached" });
//   }

//   const student = await Student.findByIdAndUpdate(
//     req.params.id,
//     { instructorId },
//     { new: true }
//   );

//   if (count + 1 >= instructor.maxStudents) {
//     instructor.isAvailable = false;
//     await instructor.save();
//   }

//   res.json({ msg: "Instructor assigned", student });
// };

// /* ---------------- INSTRUCTOR LEAVE ---------------- */
// export const instructorLeave = async (req, res) => {
//   const instructor = await Instructor.findByIdAndUpdate(
//     req.params.id,
//     { isAvailable: req.body.isAvailable },
//     { new: true }
//   );

//   res.json({ msg: "Availability updated", instructor });
// };


/* ---------------- INSTRUCTOR CRUD ---------------- */

// CREATE
// export const createInstructor = async (req, res) => {
//   const instructor = await Instructor.create(req.body);
//   res.status(201).json({ msg: "Instructor created", instructor });
// };


export const createInstructor = async (req, res) => {




  const { userId, name } = req.body;

  // 1️⃣ Find registered user
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  // 2️⃣ Check role
  if (user.role !== "instructor") {
    return res.status(400).json({
      msg: "This user is not registered as instructor"
    });
  }

  // 3️⃣ NAME MATCH CHECK 🔥
  if (user.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
    return res.status(400).json({
      msg: "Instructor name does not match registered name"
    });
  }

  // 4️⃣ Prevent duplicate profile
  const exists = await Instructor.findOne({ userId });
  if (exists) {
    return res.status(400).json({
      msg: "Instructor profile already exists"
    });
  }

  // 5️⃣ Create profile
  const instructor = await Instructor.create({
    userId,
    name,
    phone: req.body.phone,
    experience: req.body.experience,
    licenseNumber: req.body.licenseNumber,
    license: req.body.license,
    about: req.body.about,
    image: req.body.image,
    maxStudents: req.body.maxStudents
  });

  res.status(201).json({
    msg: "Instructor profile created successfully",
    instructor
  });
};


// READ ALL (ACTIVE ONLY)
export const getInstructors = async (req, res) => {
  const instructorsRaw = await Instructor.find({ status: "active" }).populate("userId", "name email");

  const instructors = await Promise.all(instructorsRaw.map(async (instructor) => {
    const studentCount = await Student.countDocuments({ instructorId: instructor._id });
    return {
      ...instructor.toObject(),
      currentStudents: studentCount
    };
  }));

  res.json(instructors);
};

// READ ONE
export const getInstructorById = async (req, res) => {
  const instructorRaw = await Instructor.findById(req.params.id).populate("userId", "name email");
  if (!instructorRaw)
    return res.status(404).json({ msg: "Instructor not found" });

  const studentCount = await Student.countDocuments({ instructorId: instructorRaw._id });

  const instructor = {
    ...instructorRaw.toObject(),
    currentStudents: studentCount
  };

  res.json(instructor);
};





// UPDATE
export const updateInstructor = async (req, res) => {
  const instructor = await Instructor.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json({ msg: "Instructor updated", instructor });
};


// DELETE
export const deleteInstructor = async (req, res) => {
  await Instructor.findByIdAndDelete(req.params.id);
  res.json({ msg: "Instructor deleted" });
};

// --- PENDING INSTRUCTOR MANAGEMENT ---

// GET PENDING
export const getPendingInstructors = async (req, res) => {
  try {
    const pending = await Instructor.find({ status: "pending" }).populate("userId", "name email");
    res.json(pending);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// APPROVE
export const approveInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );
    res.json({ msg: "Instructor approved successfully", instructor });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// REJECT
export const rejectInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json({ msg: "Instructor rejected", instructor });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getUnprofiledInstructors = async (req, res) => {
  try {
    // 1️⃣ Find all users with role 'instructor'
    const instructorUsers = await User.find({ role: "instructor" });

    // 2️⃣ Find all existing instructor profile userIds
    const profiledUserIds = await Instructor.find().distinct("userId");

    // 3️⃣ Filter out users who already have a profile
    const availableUsers = instructorUsers.filter(user =>
      !profiledUserIds.some(id => id.toString() === user._id.toString())
    );

    res.json(availableUsers);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching available instructors" });
  }
};

export const getMyInstructorProfile = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ userId: req.user.userId })
      .populate("userId", "name email")
      .populate("assignedVehicle", "name");

    if (!instructor) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    // Count assigned students
    const studentCount = await Student.countDocuments({ instructorId: instructor._id });

    // Combine instructor data with student count
    const instructorData = {
      ...instructor.toObject(),
      studentCount
    };

    res.status(200).json(instructorData);
  } catch (error) {
    console.error("Error in getMyInstructorProfile:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateMyInstructorProfile = async (req, res) => {
  try {
    const { phone, experience, about, image, trainingCertificate } = req.body;

    // Find the instructor by userId from token
    const instructor = await Instructor.findOne({ userId: req.user.userId });

    if (!instructor) {
      return res.status(404).json({ msg: "Instructor profile not found" });
    }

    // Update allowed fields
    if (phone !== undefined) instructor.phone = phone;
    if (experience !== undefined) instructor.experience = experience;
    if (about !== undefined) instructor.about = about;
    if (image !== undefined) instructor.image = image;
    if (trainingCertificate !== undefined) instructor.trainingCertificate = trainingCertificate;

    await instructor.save();

    res.json({
      msg: "Profile updated successfully",
      instructor
    });
  } catch (error) {
    console.error("Error in updateMyInstructorProfile:", error);
    res.status(500).json({ msg: "Server error updating profile" });
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`[getMyStudents] Fetching students for instructor User ID: ${userId}`);

    // 1️⃣ Find the instructor profile using the userId from token
    const instructor = await Instructor.findOne({ userId });

    if (!instructor) {
      console.warn(`[getMyStudents] Instructor profile not found for User ID: ${userId}`);
      return res.status(404).json({ msg: "Instructor profile not found" });
    }

    console.log(`[getMyStudents] Found instructor profile: ${instructor._id} (${instructor.name})`);

    // 2️⃣ Find students assigned to this instructor's profile ID
    const studentsDirect = await Student.find({
      instructorId: instructor._id
    }).populate("userId", "name email");

    // 3️⃣ Find students linked via ACTIVE schedules
    const scheduledStudentsRaw = await Schedule.find({
      instructor: instructor._id,
      status: { $in: ["Scheduled", "In Progress"] }
    }).populate({
      path: "student",
      populate: { path: "userId", select: "name email" }
    });

    const scheduledStudents = scheduledStudentsRaw
      .map(s => s.student)
      .filter(s => s !== null);

    // 4️⃣ Merge lists and remove duplicates
    const allStudentsMap = new Map();

    studentsDirect.forEach(s => {
      allStudentsMap.set(s._id.toString(), {
        ...s.toObject(),
        linkSource: "Permanent Assignment"
      });
    });

    scheduledStudents.forEach(s => {
      if (!allStudentsMap.has(s._id.toString())) {
        allStudentsMap.set(s._id.toString(), {
          ...s.toObject(),
          linkSource: "Active Schedule"
        });
      }
    });

    const mergedStudents = Array.from(allStudentsMap.values());
    console.log(`[getMyStudents] Found ${mergedStudents.length} unique students (Direct: ${studentsDirect.length}, Scheduled Only: ${mergedStudents.length - studentsDirect.length})`);

    // 5️⃣ Enriched students with eligibility info
    const students = await Promise.all(mergedStudents.map(async (studentObj) => {
      const studentId = studentObj._id;
      const drivingTest = await DrivingTest.findOne({ student: studentId });
      let isEligibleForLicense = false;
      let eligibilityMessage = "Test not scheduled";

      if (drivingTest) {
        if (drivingTest.status === "ACTIVE") {
          const allPassed = drivingTest.tests.length > 0 && drivingTest.tests.every(t => t.result === "PASS");
          isEligibleForLicense = allPassed;
          eligibilityMessage = allPassed ? "Eligible ✅" : "Not Eligible ❌";
        } else {
          eligibilityMessage = "Test Cancelled";
        }
      }

      return {
        ...studentObj,
        isEligibleForLicense,
        eligibilityMessage
      };
    }));

    res.json(students);
  } catch (error) {
    console.error("[getMyStudents Error]:", error);
    res.status(500).json({ msg: "Server error while fetching students" });
  }
};



// driving tests view

export const getMyDrivingtests = async (req, res) => {
  try {
    const userId = req.user.userId;
    const instructor = await Instructor.findOne({ userId });

    if (!instructor) {
      return res.status(404).json({ msg: "Instructor profile not found" });
    }

    // 1️⃣ Find all students assigned to this instructor
    const students = await Student.find({ instructorId: instructor._id });
    const studentIds = students.map(s => s._id);

    // 2️⃣ Find driving tests for these students
    const drivingtests = await DrivingTest.find({
      student: { $in: studentIds }
    }).populate({
      path: 'student',
      populate: { path: 'userId', select: 'name email' }
    });

    res.json(drivingtests);
  } catch (error) {
    console.error("[getMyDrivingtests Error]:", error);
    res.status(500).json({ msg: "Server error while fetching driving tests" });
  }
};


// attendance view for instructors
export const getMyInstructorAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const instructor = await Instructor.findOne({ userId });

    if (!instructor) {
      return res.status(404).json({ msg: "Instructor profile not found" });
    }

    // 1️⃣ Find all students assigned to this instructor
    const students = await Student.find({ instructorId: instructor._id });
    const studentIds = students.map(s => s._id);

    // 2️⃣ Find attendance records for these students
    const attendance = await Attendance.find({
      student: { $in: studentIds }
    }).populate({
      path: 'student',
      populate: { path: 'userId', select: 'name email' }
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error("[getMyInstructorAttendance Error]:", error);
    res.status(500).json({ msg: "Server error while fetching attendance" });
  }
};


/* ---------------- ASSIGN INSTRUCTOR TO STUDENT ---------------- */


export const assignInstructorToStudent = async (req, res) => {
  try {
    const { instructorId } = req.body;
    const studentId = req.params.id;

    // 1️⃣ Check student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // 2️⃣ Check for same assignment
    if (student.instructorId && student.instructorId.toString() === instructorId) {
      return res.status(400).json({
        msg: "This instructor is already assigned to the student"
      });
    }

    // 3️⃣ Check instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor || !instructor.isAvailable) {
      return res.status(400).json({ msg: "Instructor unavailable" });
    }

    // 4️⃣ Count students of instructor
    const currentCount = await Student.countDocuments({ instructorId });

    if (currentCount >= instructor.maxStudents) {
      instructor.isAvailable = false;
      await instructor.save();
      return res.status(400).json({ msg: "Instructor limit reached" });
    }

    // 5️⃣ Assign instructor
    console.log(`[assignInstructorToStudent] Assigning instructor ID ${instructorId} to student ${studentId}`);
    student.instructorId = instructorId;
    await student.save();
    console.log(`[assignInstructorToStudent] Assignment saved successfully`);

    // 6️⃣ Auto set unavailable if limit reached
    if (currentCount + 1 >= instructor.maxStudents) {
      instructor.isAvailable = false;
      await instructor.save();
    }

    res.json({
      msg: "Instructor assigned successfully",
      student
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
/* ---------------- INSTRUCTOR ON LEAVE ---------------- */
export const instructorOnLeave = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        msg: "isAvailable must be true or false"
      });
    }

    const instructor = await Instructor.findById(instructorId);

    if (!instructor) {
      return res.status(404).json({
        msg: "Instructor not found"
      });
    }

    instructor.isAvailable = isAvailable;
    await instructor.save();

    res.status(200).json({
      msg: isAvailable
        ? "Instructor is now available"
        : "Instructor is on leave",
      instructor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//-----VEHICLE-------//



export const addVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getVehicles = async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
};
export const getVehicleById = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle)
    return res.status(404).json({ msg: "vehicle not found" });

  res.json(vehicle);
};


export const updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(vehicle);
};


// export const deleteVehicle = async (req, res) => {
//   await Vehicle.findByIdAndDelete(req.params.id);
//   res.json({ message: "Vehicle removed" });
// };


export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid vehicle ID" });
  }

  const vehicle = await Vehicle.findByIdAndDelete(id);

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  res.json({ message: "Vehicle removed" });
};

//----------SCHEDULE--------//



/* ================================
   CREATE SCHEDULE (ADMIN)
================================ */
export const createSchedule = async (req, res) => {
  try {
    const {
      student,
      instructor,
      vehicle,
      date,
      startTime,
      endTime,
      type,
      status
    } = req.body;

    // Validate student
    const studentData = await Student.findById(student);
    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate instructor
    const instructorData = await Instructor.findById(instructor);
    if (!instructorData) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // TEST restriction
    if (type === "TEST" && studentData.isVerified === false) {
      return res.status(403).json({
        message: "Unverified student cannot attend test"
      });
    }

    // 0. Check if Instructor is already scheduled for a DIFFERENT practice type at this time
    // Ground and Road practice cannot be mixed at the same time for the same instructor
    const instructorOtherTypeConflict = await Schedule.findOne({
      instructor,
      type: { $ne: type },
      date,
      status: { $in: ["Scheduled", "In Progress"] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (instructorOtherTypeConflict) {
      return res.status(409).json({
        message: "Instructor is already scheduled for a different practice type (Ground/Road) at this time"
      });
    }

    // 1. Check if Instructor is already scheduled with a DIFFERENT vehicle at this time
    const instructorOtherVehicleConflict = await Schedule.findOne({
      instructor,
      vehicle: { $ne: vehicle },
      date,
      status: { $in: ["Scheduled", "In Progress"] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (instructorOtherVehicleConflict) {
      return res.status(409).json({
        message: "Instructor is already scheduled with a different vehicle at this time"
      });
    }

    // 2. Check if Vehicle is already scheduled with a DIFFERENT instructor at this time
    const vehicleOtherInstructorConflict = await Schedule.findOne({
      vehicle,
      instructor: { $ne: instructor },
      date,
      status: { $in: ["Scheduled", "In Progress"] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (vehicleOtherInstructorConflict) {
      return res.status(409).json({
        message: "Vehicle is already booked with a different instructor at this time"
      });
    }

    // 3. Check total count for this Instructor + Vehicle combo
    const comboConflictCount = await Schedule.countDocuments({
      instructor,
      vehicle,
      date,
      status: { $in: ["Scheduled", "In Progress"] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (comboConflictCount >= 3) {
      return res.status(409).json({
        message: "This Instructor and Vehicle combination already has the maximum (3) students scheduled at this time"
      });
    }
    //Student conflict
    const studentConflict = await Schedule.findOne({
      student,
      date,
      status: { $in: ["Scheduled", "In Progress"] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (studentConflict) {
      return res.status(409).json({
        message: "Student already has a schedule at this time"
      });
    }

    // Create schedule
    const schedule = await Schedule.create({
      student,
      instructor,
      vehicle,
      date,
      startTime,
      endTime,
      type,
      status: status || "Scheduled"
    });

    // Create notifications for Student and Instructor
    try {
      const notificationsToInsert = [];
      if (studentData.userId) {
        notificationsToInsert.push({
          userId: studentData.userId,
          message: `A new ${type === "ROAD_PRACTICE" ? "Road Practice" : "Ground Practice"} schedule has been assigned to you on ${date} from ${startTime} to ${endTime}.`,
          type: "schedule"
        });
      }
      if (instructorData.userId) {
        notificationsToInsert.push({
          userId: instructorData.userId,
          message: `You have been assigned to instruct ${studentData.name} on ${date} from ${startTime} to ${endTime}.`,
          type: "schedule"
        });
      }
      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }
    } catch (notifErr) {
      console.error("Error creating notifications:", notifErr);
    }

    res.status(201).json({
      message: "Schedule created successfully",
      schedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   NOTIFICATIONS
================================ */

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ msg: "Notification not found" });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ msg: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   GET ALL SCHEDULES
================================ */
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("student instructor vehicle");

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   GET MY SCHEDULES (FOR STUDENTS)
================================ */
export const getMySchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const schedules = await Schedule.find({ student: student._id })
      .populate("student instructor vehicle");

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   GET MY SCHEDULES (FOR INSTRUCTORS)
================================ */
export const getMyInstructorSchedules = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`[getMyInstructorSchedules] Searching for instructor with userId: ${userId}`);

    const instructor = await Instructor.findOne({ userId });

    if (!instructor) {
      console.warn(`[getMyInstructorSchedules] Instructor profile not found for userId: ${userId}`);
      return res.status(404).json({ message: "Instructor profile not found" });
    }

    console.log(`[getMyInstructorSchedules] Found instructor: ${instructor._id}. Fetching schedules...`);

    const schedules = await Schedule.find({ instructor: instructor._id })
      .populate("student instructor vehicle");

    console.log(`[getMyInstructorSchedules] Found ${schedules.length} schedules.`);
    res.status(200).json(schedules);
  } catch (error) {
    console.error("[getMyInstructorSchedules Error]:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   GET SINGLE SCHEDULE
================================ */
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate("student instructor vehicle");

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   UPDATE SCHEDULE
================================ */
export const updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const existingSchedule = await Schedule.findById(scheduleId);

    if (!existingSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const {
      instructor = existingSchedule.instructor,
      vehicle = existingSchedule.vehicle,
      date = existingSchedule.date,
      startTime = existingSchedule.startTime,
      endTime = existingSchedule.endTime,
      student = existingSchedule.student,
      type = existingSchedule.type
    } = req.body;

    if (instructor && vehicle && date && startTime && endTime) {
      // 0. Check if Instructor is already scheduled for a DIFFERENT practice type at this time
      // Ground and Road practice cannot be mixed at the same time for the same instructor
      const instructorOtherTypeConflict = await Schedule.findOne({
        _id: { $ne: scheduleId },
        instructor,
        type: { $ne: type },
        date,
        status: { $in: ["Scheduled", "In Progress"] },
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      if (instructorOtherTypeConflict) {
        return res.status(409).json({
          message: "Instructor is already scheduled for a different practice type (Ground/Road) at this time"
        });
      }

      // 1. Check if Instructor is already scheduled with a DIFFERENT vehicle at this time
      const instructorOtherVehicleConflict = await Schedule.findOne({
        _id: { $ne: scheduleId },
        instructor,
        vehicle: { $ne: vehicle },
        date,
        status: { $in: ["Scheduled", "In Progress"] },
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      if (instructorOtherVehicleConflict) {
        return res.status(409).json({
          message: "Instructor is already scheduled with a different vehicle at this time"
        });
      }

      // 2. Check if Vehicle is already scheduled with a DIFFERENT instructor at this time
      const vehicleOtherInstructorConflict = await Schedule.findOne({
        _id: { $ne: scheduleId },
        vehicle,
        instructor: { $ne: instructor },
        date,
        status: { $in: ["Scheduled", "In Progress"] },
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      if (vehicleOtherInstructorConflict) {
        return res.status(409).json({
          message: "Vehicle is already booked with a different instructor at this time"
        });
      }

      // 3. Check total count for this Instructor + Vehicle combo
      const comboConflictCount = await Schedule.countDocuments({
        _id: { $ne: scheduleId },
        instructor,
        vehicle,
        date,
        status: { $in: ["Scheduled", "In Progress"] },
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      if (comboConflictCount >= 3) {
        return res.status(409).json({
          message: "This Instructor and Vehicle combination already has the maximum (3) students scheduled at this time"
        });
      }

      // 4. Student conflict
      const studentConflict = await Schedule.findOne({
        _id: { $ne: scheduleId },
        student,
        date,
        status: "Scheduled",
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
      });

      if (studentConflict) {
        return res.status(409).json({
          message: "Student already has a schedule at this time"
        });
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   DELETE / CANCEL SCHEDULE
================================ */
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({
      message: "Schedule deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================================
   UPDATE STATUS ONLY (OPTIONAL)
================================ */
export const updateScheduleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json({
      message: "Schedule status updated",
      schedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




/* ================= UPDATE PAYMENT ================= */
export const updatePayment = async (req, res) => {
  try {
    const { id: paymentId } = req.params;
    const { amount, paymentMode, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

    if (paymentMode && !["Cash", "Online"].includes(paymentMode)) {
      return res.status(400).json({
        message: "paymentMode must be Cash or Online"
      });
    }

    // Normalize status if present
    let normalizedStatus = status;
    if (status) {
      const s = status.trim();
      if (s.toLowerCase() === "paid") normalizedStatus = "Paid";
      else if (s.toLowerCase() === "pending") normalizedStatus = "Pending";
      else {
        return res.status(400).json({
          message: "status must be Paid or Pending"
        });
      }
    }

    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (paymentMode !== undefined) updateData.paymentMode = paymentMode;
    if (normalizedStatus !== undefined) {
      updateData.status = normalizedStatus;
      updateData.paymentDate = normalizedStatus === "Paid" ? new Date() : null;

      // Generate receipt number if missing when status becomes "Paid"
      if (normalizedStatus === "Paid") {
        const currentPayment = await Payment.findById(paymentId);
        if (currentPayment && !currentPayment.receiptNumber) {
          updateData.receiptNumber = `RCPT-${Date.now()}`;
        }
      }
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment updated successfully",
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//verify//
export const verifyStudent = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    console.log("Verifying Student ID:", studentId); // Debugging log

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // CHECK PAYMENT
    const payments = await Payment.find({ studentId });
    const totalPaid = payments
      .filter(p => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);

    const TOTAL_FEE = 15000; // Define applicable fee

    if (totalPaid < TOTAL_FEE) {
      return res.status(400).json({
        message: `Cannot verify student. Payment incomplete. Paid: ${totalPaid}, Required: ${TOTAL_FEE}`
      });
    }

    student.isVerified = true;
    await student.save();

    res.status(200).json({
      message: "Student verified successfully",
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// controllers/payment.controller.js


/* ================= CREATE PAYMENT ================= */
export const createPayment = async (req, res) => {
  try {
    const { studentId, amount, paymentMode } = req.body;

    if (!studentId || !amount || !paymentMode) {
      return res.status(400).json({
        message: "studentId, amount and paymentMode are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }

    if (!["Cash", "Online"].includes(paymentMode)) {
      return res.status(400).json({
        message: "paymentMode must be Cash or Online"
      });
    }

    const payment = await Payment.create({
      studentId,
      amount,
      paymentMode,
      status: "Paid",
      receiptNumber: `RCPT-${Date.now()}`,
      paymentDate: new Date()
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "studentId",
      populate: { path: "userId", select: "name" }
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get my payments (for students)
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token

    // Find the student record using userId
    const student = await Student.findOne({ userId });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found. Please contact admin."
      });
    }

    // Get all payments for this student
    const payments = await Payment.find({ studentId: student._id });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get payments for a specific student (Admin/Instructor)
export const getPaymentsByStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const payments = await Payment.find({ studentId: id });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET MY PROFILE (FOR STUDENTS) ================= */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token

    // Find the student record using userId and populate instructor
    const student = await Student.findOne({ userId }).populate("instructorId");

    if (!student) {
      console.warn(`[getMyProfile] Student profile not found for userId: ${userId}`);
      return res.status(404).json({
        message: "Your student profile hasn't been created yet. Please contact the administrator."
      });
    }

    // Also get the user info for email
    const user = await User.findById(userId);

    // Combine student and user data
    const profileData = {
      ...student.toObject(),
      email: user?.email || "N/A",
      role: user?.role || "student"
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("[getMyProfile Error]:", error);
    res.status(500).json({ error: "Failed to load profile. Please try again later." });
  }
};

/* ================= UPDATE MY PROFILE (FOR STUDENTS) ================= */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, dob, address, documents: updatedDocs } = req.body;

    // 1. Update Student Profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (phone !== undefined) student.phone = phone;
    if (dob !== undefined) student.dob = dob;
    if (address !== undefined) student.address = address;
    if (name !== undefined) student.name = name; // Update name in student profile too

    // ❌ Handle Documents Update
    if (updatedDocs && Array.isArray(updatedDocs)) {
      updatedDocs.forEach(updatedDoc => {
        const existingDocIndex = student.documents.findIndex(
          doc => doc.documentName === updatedDoc.documentName
        );

        if (existingDocIndex !== -1) {
          // Update existing document if content changed
          if (updatedDoc.fileBase64 && updatedDoc.fileBase64 !== student.documents[existingDocIndex].fileBase64) {
            student.documents[existingDocIndex].fileBase64 = updatedDoc.fileBase64;
            student.documents[existingDocIndex].verified = false; // Reset verification
          }
        }
      });
    }

    await student.save();

    // 2. Update User Name if provided
    if (name !== undefined) {
      await User.findByIdAndUpdate(userId, { name });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student
    });
  } catch (error) {
    console.error("[updateMyProfile Error]:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// get payment by id
export const getPaymentById = async (req, res) => {
  try {
    const { id: paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ================= DELETE PAYMENT ================= */
export const deletePayment = async (req, res) => {
  try {
    const { id: paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




//--DRIVING TEST---//



/* ---------------------------------------------------
   CREATE – Schedule Driving Test
   Bike / Car / Both (same date, same student)
--------------------------------------------------- */
export const scheduleDrivingTest = async (req, res) => {
  try {
    const { studentId, testDate, learnersTestDate, vehicleTypes } = req.body;

    if (!studentId || (!testDate && !learnersTestDate)) {
      return res.status(400).json({
        message: "studentId and at least one test date (Main or Learners) are required"
      });
    }

    if (testDate && !vehicleTypes?.length) {
      return res.status(400).json({
        message: "Vehicle types are required when scheduling a driving test"
      });
    }

    // 0️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId format" });
    }

    // 1️⃣ Student check (flexible: search by student _id OR userId)
    const student = await Student.findOne({
      $or: [{ _id: studentId }, { userId: studentId }]
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const resolvedStudentId = student._id;

    // Verification check
    // if (!student.isVerified) {
    //   return res.status(403).json({
    //     message: "Student not verified. Cannot schedule test"
    //   });
    // }

    // Prevent duplicate vehicle (BIKE twice / CAR twice)
    if (new Set(vehicleTypes).size !== vehicleTypes.length) {
      return res.status(400).json({
        message: "Same vehicle cannot be selected twice"
      });
    }

    // One test document per student
    const existingTest = await DrivingTest.findOne({ student: resolvedStudentId });
    if (existingTest) {
      return res.status(400).json({
        message: "Driving test already scheduled for this student"
      });
    }

    // Prepare tests array
    const tests = vehicleTypes.map(type => ({
      vehicleType: type
    }));

    const drivingTest = await DrivingTest.create({
      student: resolvedStudentId,
      testDate,
      learnersTestDate,
      tests
    });

    res.status(201).json({
      message: "Driving test scheduled successfully",
      drivingTest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------------------------------
   READ – Get Driving Test by Student
--------------------------------------------------- */
// export const getDrivingTestByStudent = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const test = await DrivingTest.findOne({
//       student: studentId
//     }).populate("student", "name email");

//     if (!test) {
//       return res.status(404).json({
//         message: "Driving test not found"
//       });
//     }

//     res.status(200).json(test);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// export const getDrivingTestByStudent = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     const test = await DrivingTest.findOne({
//       student: new mongoose.Types.ObjectId(studentId)
//     }).populate("student", "name email");

//     if (!test) {
//       return res.status(404).json({
//         message: "No driving test found for this student"
//       });
//     }

//     res.status(200).json(test);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
export const getDrivingTestsByStudent = async (req, res) => {
  try {
    const { id: studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const student = await Student.findOne({
      $or: [{ _id: studentId }, { userId: studentId }]
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const tests = await DrivingTest.find({
      student: student._id
    }).populate("student", "name email");

    if (!tests || tests.length === 0) {
      return res.status(404).json({
        message: "No driving tests found for this student"
      });
    }

    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/* ---------------------------------------------------
   READ – Get All ACTIVE Driving Tests (Admin)
--------------------------------------------------- */
export const getAllActiveDrivingTests = async (req, res) => {
  try {
    const tests = await DrivingTest.find({
      status: "ACTIVE"
    }).populate("student", "name email");

    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🏎️ Get All Driving Tests (Admin - All statuses)
 */
export const getAllDrivingTests = async (req, res) => {
  try {
    const tests = await DrivingTest.find()
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ testDate: -1 });

    res.status(200).json(tests);
  } catch (error) {
    console.error("[getAllDrivingTests Error]:", error);
    res.status(500).json({ error: "Failed to fetch all driving test records" });
  }
};

/* ---------------------------------------------------
   UPDATE – Update Learners Test Result
--------------------------------------------------- */
export const updateLearnersTestResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { result, remarks } = req.body;

    if (!["PASS", "FAIL", "PENDING"].includes(result)) {
      return res.status(400).json({
        message: "Result must be PASS, FAIL or PENDING"
      });
    }

    const drivingTest = await DrivingTest.findById(id);

    if (!drivingTest) {
      return res.status(404).json({
        message: "Driving test record not found"
      });
    }

    drivingTest.learnersTestResult = result;
    if (remarks !== undefined) {
      drivingTest.learnersTestRemarks = remarks;
    }

    await drivingTest.save();

    res.status(200).json({
      message: "Learners test result updated successfully",
      drivingTest
    });
  } catch (error) {
    console.error("[updateLearnersTestResult Error]:", error);
    res.status(500).json({ error: "Failed to update learners test result" });
  }
};

/* ---------------------------------------------------
   UPDATE – Update Result (BIKE / CAR)
--------------------------------------------------- */
export const updateDrivingTestResult = async (req, res) => {
  try {
    const { id: studentId, licenceType } = req.params;
    const { result, remarks } = req.body;

    console.log("Update Driving Test Request:", { studentId, licenceType, result, remarks });

    const typeMap = {
      "LMV": "CAR",
      "MCWG": "BIKE",
      "CAR": "CAR",
      "BIKE": "BIKE"
    };

    const normalizedType = licenceType.toUpperCase();
    const mappedType = typeMap[normalizedType] || normalizedType;

    if (!["PASS", "FAIL", "PENDING", "RE-TEST"].includes(result)) {
      return res.status(400).json({
        message: "Result must be PASS, FAIL, PENDING or RE-TEST"
      });
    }

    const student = await Student.findOne({
      $or: [{ _id: studentId }, { userId: studentId }]
    });

    const studentDocId = student ? student._id : studentId;
    console.log("Student Doc ID:", studentDocId);

    const drivingTest = await DrivingTest.findOne({
      student: studentDocId,
      status: "ACTIVE"
    });

    console.log("Driving Test Found:", drivingTest);

    if (!drivingTest) {
      return res.status(404).json({
        message: "Active driving test not found"
      });
    }

    const test = drivingTest.tests.find(
      t => t.vehicleType.toUpperCase() === normalizedType || t.vehicleType.toUpperCase() === mappedType
    );

    console.log("Specific Test Found:", test, "Normalized Type:", normalizedType, "Mapped Type:", mappedType);

    if (!test) {
      return res.status(404).json({
        message: `${licenceType} test not found for this student`
      });
    }



    test.result = result;
    test.remarks = remarks;

    await drivingTest.save();

    res.status(200).json({
      message: `${licenceType} test result updated successfully`,
      drivingTest
    });
  } catch (error) {
    console.error("Detailed Update Driving Test Error:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------------------------------
   SOFT DELETE – Cancel Driving Test
   (Instead of DELETE)
--------------------------------------------------- */
export const cancelDrivingTest = async (req, res) => {
  try {
    const { id: studentId } = req.params;

    const student = await Student.findOne({
      $or: [{ _id: studentId }, { userId: studentId }]
    });

    const studentDocId = student ? student._id : studentId;

    const drivingTest = await DrivingTest.findOne({
      student: studentDocId
    });

    if (!drivingTest) {
      return res.status(404).json({
        message: "Driving test not found"
      });
    }

    drivingTest.status = "CANCELLED";
    await drivingTest.save();

    res.status(200).json({
      message: "Driving test cancelled successfully",
      drivingTest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------------------------------
   LICENSE ELIGIBILITY CHECK
   (Both BIKE & CAR must be PASS)
--------------------------------------------------- */
// export const checkLicenseEligibility = async (req, res) => {
//   try {
//     const { id: studentId } = req.params;

//     const drivingTest = await DrivingTest.findOne({
//       student: studentId,
//       status: "ACTIVE"
//     });

//     if (!drivingTest) {
//       return res.status(404).json({
//         message: "Driving test not found"
//       });
//     }
// if (!drivingTest) {
//   return res.status(400).json({
//     eligibleForLicense: false,
//     message: "Driving test is cancelled or inactive"
//   });
// }

//     const allPassed = drivingTest.tests.every(
//       test => test.result === "PASS"
//     );

//     res.status(200).json({
//       eligibleForLicense: allPassed,
//       message: allPassed
//         ? "Student eligible for license"
//         : "Student not eligible for license"
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


export const checkLicenseEligibility = async (req, res) => {
  try {
    const { id: studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const student = await Student.findOne({
      $or: [{ _id: studentId }, { userId: studentId }]
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const drivingTest = await DrivingTest.findOne({ student: student._id });

    if (!drivingTest) {
      return res.status(404).json({
        message: "Driving test record not found for this student. Eligibility cannot be determined."
      });
    }

    if (drivingTest.status !== "ACTIVE") {
      return res.status(400).json({
        eligibleForLicense: false,
        message: "Driving test is cancelled"
      });
    }

    const allPassed = drivingTest.tests.every(
      test => test.result === "PASS"
    );

    res.status(200).json({
      eligibleForLicense: allPassed,
      message: allPassed
        ? "Student eligible for license"
        : "Student not eligible for license"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📄 Get All Pending Documents (Admin)
 */
export const getPendingDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ verified: false }).lean();

    const enrichedDocuments = await Promise.all(documents.map(async (doc) => {
      // Keep track of original ID
      const studentId = doc.student;

      // 1. Try to find as a Student profile ID
      let resolvedStudent = await Student.findById(studentId).populate("userId", "name email").lean();

      // 2. If not found, maybe studentId was a UserID (legacy)
      if (!resolvedStudent && studentId) {
        resolvedStudent = await Student.findOne({ userId: studentId }).populate("userId", "name email").lean();

        // 3. If still not found, it might be a User without a student profile yet
        if (!resolvedStudent && studentId) {
          const user = await User.findById(studentId).select("name email").lean();
          if (user) {
            resolvedStudent = {
              name: user.name,
              email: user.email,
              userId: { name: user.name, email: user.email }, // Mock userId for frontend compatibility
              isLegacy: true
            };
          }
        }
      }

      // If we found something, ensure it has a name even if nested
      if (resolvedStudent && !resolvedStudent.name && resolvedStudent.userId?.name) {
        resolvedStudent.name = resolvedStudent.userId.name;
      }

      if (resolvedStudent && !resolvedStudent.email && resolvedStudent.userId?.email) {
        resolvedStudent.email = resolvedStudent.userId.email;
      }

      return {
        ...doc,
        student: resolvedStudent || studentId // Fallback to ID string if lookup failed
      };
    }));

    res.status(200).json(enrichedDocuments);
  } catch (error) {
    console.error("[getPendingDocuments Error]:", error);
    res.status(500).json({ error: "Failed to fetch pending documents" });
  }
};

/**
 * 📄 Get All Verified Documents (Admin)
 */
export const getVerifiedDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ verified: true }).lean();

    const enrichedDocuments = await Promise.all(documents.map(async (doc) => {
      const studentId = doc.student;

      // 1. Try to find as a Student profile ID
      let resolvedStudent = await Student.findById(studentId).populate("userId", "name email").lean();

      // 2. If not found, maybe doc.student was a UserID (legacy)
      if (!resolvedStudent && studentId) {
        resolvedStudent = await Student.findOne({ userId: studentId }).populate("userId", "name email").lean();

        if (!resolvedStudent && studentId) {
          const user = await User.findById(studentId).select("name email").lean();
          if (user) {
            resolvedStudent = {
              name: user.name,
              email: user.email,
              userId: { name: user.name, email: user.email },
              isLegacy: true
            };
          }
        }
      }

      // Populate names correctly
      if (resolvedStudent && !resolvedStudent.name && resolvedStudent.userId?.name) {
        resolvedStudent.name = resolvedStudent.userId.name;
      }
      if (resolvedStudent && !resolvedStudent.email && resolvedStudent.userId?.email) {
        resolvedStudent.email = resolvedStudent.userId.email;
      }

      // Also populate verifiedBy
      let verifiedBy = null;
      if (doc.verifiedBy) {
        verifiedBy = await User.findById(doc.verifiedBy).select("name").lean();
      }

      return {
        ...doc,
        student: resolvedStudent || studentId,
        verifiedBy
      };
    }));

    res.status(200).json(enrichedDocuments);
  } catch (error) {
    console.error("[getVerifiedDocuments Error]:", error);
    res.status(500).json({ error: "Failed to fetch verified document history" });
  }
};
/**
 * 🎓 Get All Verified Students (Admin)
 */
export const getVerifiedStudents = async (req, res) => {
  try {
    const students = await Student.find({ isVerified: true })
      .populate("userId", "name email");

    res.status(200).json(students);
  } catch (error) {
    console.error("[getVerifiedStudents Error]:", error);
    res.status(500).json({ error: "Failed to fetch verified student profiles" });
  }
};

/**
 * 🔒 Verify Student Profile (Admin)
 */
export const verifyStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔞 Pre-verification Age Check
    const studentCheck = await Student.findById(id);
    if (studentCheck && studentCheck.dob && calculateAge(studentCheck.dob) < 18) {
      return res.status(400).json({ message: "Verification failed: Student is under 18 years old." });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    ).populate("userId", "name");

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.status(200).json({
      message: "Student profile verified successfully",
      student
    });
  } catch (error) {
    console.error("[verifyStudentProfile Error]:", error);
    res.status(500).json({ error: "Failed to verify student profile" });
  }
};

/**
 * 📊 Get Admin Dashboard Stats
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeInstructors = await Instructor.countDocuments({ isAvailable: true });
    const pendingPayments = await Payment.countDocuments({ status: "Pending" });

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    const todaySchedules = await Schedule.countDocuments({ date: today });
    const unverifiedStudents = await Student.countDocuments({ isVerified: false });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeInstructors,
        pendingPayments,
        todaySchedules,
        unverifiedStudents
      }
    });
  } catch (error) {
    console.error("[getAdminStats Error]:", error);
    res.status(500).json({ success: false, error: "Failed to fetch dashboard statistics" });
  }
};

/**
 * 🎓 Get All Unverified Students (Admin)
 */
export const getUnverifiedStudents = async (req, res) => {
  try {
    const students = await Student.find({ isVerified: false })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("[getUnverifiedStudents Error]:", error);
    res.status(500).json({ error: "Failed to fetch unverified student profiles" });
  }
};
