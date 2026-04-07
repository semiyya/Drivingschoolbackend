



import { Router } from "express";
import * as rh from "./requesthandler.js"
import { protect, authorizeRoles } from "./Middleware/auth.js";
const router = Router();
router.route("/").get(rh.testHandler);
// router.route("/about").get(rh.aboutHandler);
router.route("/contact").post(rh.createContact);

router.route("/contact/:id").get(protect, authorizeRoles("admin"), rh.getContact);
router.route("/contact").get(protect, authorizeRoles("admin"), rh.getAllContacts);
router.route("/contact/:id").delete(protect, authorizeRoles("admin"), rh.deleteContact);
router.route("/contact/reply/:id").put(protect, authorizeRoles("admin"), rh.sendReply);

router.route("/register").post(rh.register);
router.route("/login").post(rh.login);
// Admin / Instructor only
router.route("/study-material")
    .post(protect, authorizeRoles("admin", "instructor"), rh.uploadStudyMaterial)
    .get(protect, authorizeRoles("admin", "instructor", "student"), rh.getStudyMaterials);

router.route("/study-material/:id")
    .delete(protect, authorizeRoles("admin", "instructor"), rh.deleteStudyMaterial);


// Student uploads
router.route("/documents").post(protect, authorizeRoles("student"), rh.uploadDocument);

// Admin verifies
router.put("/documents/:documentId/verify", protect, authorizeRoles("admin"), rh.verifyDocument);
router.get("/documents/pending/all", protect, authorizeRoles("admin"), rh.getPendingDocuments);
router.get("/documents/verified/all", protect, authorizeRoles("admin"), rh.getVerifiedDocuments);
router.get("/students/verified/all", protect, authorizeRoles("admin"), rh.getVerifiedStudents);
router.get("/documents/student/:userId", protect, authorizeRoles("admin", "instructor"), rh.getDocumentsByStudent);
//STUDENT//
router.get("/available-student-users", protect, authorizeRoles("admin"), rh.getUnprofiledStudents);
router.post("/students", protect, authorizeRoles("admin"), rh.createStudent);
router.get("/students", protect, authorizeRoles("admin", "instructor"), rh.getStudents);
router.get("/students/:id", protect, authorizeRoles("admin", "instructor", "student"), rh.getStudentById);
router.put("/students/:id", protect, authorizeRoles("admin"), rh.updateStudent);
router.delete("/students/:id", protect, authorizeRoles("admin"), rh.deleteStudent);
router.delete("/students/:id/reject", protect, authorizeRoles("admin"), rh.rejectStudent);

//ATTENDANCE//
// router.post("/students/:id/attendance", protect, authorizeRoles("admin", "instructor",), rh.markAttendance);
// router.patch("/students/:id/extra-classes", protect, authorizeRoles("admin",), rh.addExtraClasses);
// router.get("/students/:id/attendance", protect, authorizeRoles("admin", "instructor", "student"), rh.getAttendance);
router.post("/attendance/:id", protect, authorizeRoles("admin", "instructor"), rh.markAttendance);

router.patch("/attendance/:id/extra-classes", protect, authorizeRoles("admin"), rh.addExtraClasses);
router.get("/attendance/students/:id", protect, authorizeRoles("admin", "instructor", "student"), rh.getAttendance);
router.get("/admin/all-attendance", protect, authorizeRoles("admin"), rh.getAllAttendance);
router.put("/admin/attendance/:id", protect, authorizeRoles("admin", "instructor"), rh.updateAttendance);

//STUDENT PROFILE//
router.route("/my-profile")
    .get(protect, authorizeRoles("student", "admin"), rh.getMyProfile)
    .put(protect, authorizeRoles("student"), rh.updateMyProfile);

// instructor//
router.get("/available-instructor-users", protect, authorizeRoles("admin"), rh.getUnprofiledInstructors);
router.get("/instructors/pending", protect, authorizeRoles("admin"), rh.getPendingInstructors);
router.put("/instructors/:id/approve", protect, authorizeRoles("admin"), rh.approveInstructor);
router.put("/instructors/:id/reject", protect, authorizeRoles("admin"), rh.rejectInstructor);
router.post("/instructors", protect, authorizeRoles("admin"), rh.createInstructor);
router.get("/instructors/students", protect, authorizeRoles("admin", "instructor"), rh.getMyStudents);
router.get("/instructors", rh.getInstructors);
router.get("/instructors/:id", rh.getInstructorById);
router.put("/instructors/:id", protect, authorizeRoles("admin"), rh.updateInstructor);
router.delete("/instructors/:id", protect, authorizeRoles("admin"), rh.deleteInstructor);
router.get("/my-instructor-profile", protect, authorizeRoles("instructor"), rh.getMyInstructorProfile);
router.put("/my-instructor-profile", protect, authorizeRoles("instructor"), rh.updateMyInstructorProfile);


/* ASSIGN INSTRUCTOR TO STUDENT */
router.patch("/students/:id/assign-instructor", protect, authorizeRoles("admin"), rh.assignInstructorToStudent);


// /* INSTRUCTOR LEAVE */

router.patch("/instructors/:id/leave", protect, authorizeRoles("admin"), rh.instructorOnLeave);

//VEHICLE//
router.post("/vehicle", protect, authorizeRoles("admin"), rh.addVehicle);
router.get("/vehicle", protect, authorizeRoles("admin", "instructor", "student"), rh.getVehicles);
router.get("/Vehicle/:id", protect, authorizeRoles("admin", "instructor", "student"), rh.getVehicleById);
router.put("/vehicle/:id", protect, authorizeRoles("admin"), rh.updateVehicle);
router.delete("/vehicle/:id", protect, authorizeRoles("admin"), rh.deleteVehicle);

// SCHEDULE//
router.post("/schedule", protect, authorizeRoles("admin"), rh.createSchedule);
router.get("/schedule", protect, authorizeRoles("admin", "instructor"), rh.getAllSchedules);
router.get("/admin/schedule", protect, authorizeRoles("admin"), rh.getAllSchedules);
router.get("/my-schedule", protect, authorizeRoles("student"), rh.getMySchedules);
router.get("/my-instructor-schedule", protect, authorizeRoles("instructor"), rh.getMyInstructorSchedules);
router.get("/get-my-attendance", protect, authorizeRoles("instructor"), rh.getMyInstructorAttendance);
router.get("/get-my-driving-tests", protect, authorizeRoles("instructor"), rh.getMyDrivingtests);
router.get("/schedule/:id", protect, authorizeRoles("admin", "instructor", "student"), rh.getScheduleById);
router.put("/schedule/:id", protect, authorizeRoles("admin"), rh.updateSchedule);
router.delete("/schedule/:id", protect, authorizeRoles("admin"), rh.deleteSchedule);

//PAYMENT//
router.post("/payments", protect, authorizeRoles("admin"), rh.createPayment);
router.get("/payments", protect, authorizeRoles("admin", "instructor"), rh.getAllPayments);
router.get("/my-payments", protect, authorizeRoles("student"), rh.getMyPayments);
router.get("/payments/:id", protect, authorizeRoles("admin", "instructor"), rh.getPaymentById);
router.get("/payments/student/:id", protect, authorizeRoles("admin", "instructor"), rh.getPaymentsByStudent);
router.put("/payments/:id", protect, authorizeRoles("admin"), rh.updatePayment);
router.delete("/payments/:id", protect, authorizeRoles("admin"), rh.deletePayment);
// Profile Verification (from dashboard)
router.put("/students/:id/verify-profile", protect, authorizeRoles("admin"), rh.verifyStudentProfile);

// Payment-based Verification (from students list/payments)
router.put("/students/:id/verify-payment", protect, authorizeRoles("admin"), rh.verifyStudent);

router.get("/admin/unverified-students", protect, authorizeRoles("admin"), rh.getUnverifiedStudents);
//DRIVING TEST//
router.post("/driving-test", protect, authorizeRoles("admin"), rh.scheduleDrivingTest);
router.get("/driving-test", protect, authorizeRoles("admin", "instructor"), rh.getAllActiveDrivingTests);
router.get("/admin/all-driving-tests", protect, authorizeRoles("admin","instructor"), rh.getAllDrivingTests);
router.get("/driving-test/:id", protect, authorizeRoles("admin", "instructor", "student"), rh.getDrivingTestsByStudent);
router.put("/driving-test/:id/:licenceType", protect, authorizeRoles("admin", "instructor"), rh.updateDrivingTestResult);
router.put("/learners-test/:id/result", protect, authorizeRoles("admin", "instructor"), rh.updateLearnersTestResult);
router.delete("/driving-test/:id", protect, authorizeRoles("admin"), rh.cancelDrivingTest);

//LICENCE ELIGIBITY//

router.get("/license-eligibility/:id", protect, authorizeRoles("admin", "instructor", "student"), rh.checkLicenseEligibility);




router.get("/admin/stats", protect, authorizeRoles("admin"), rh.getAdminStats);

//NOTIFICATIONS//
router.get("/notifications", protect, authorizeRoles("student", "instructor"), rh.getMyNotifications);
router.put("/notifications/mark-all-read", protect, authorizeRoles("student", "instructor"), rh.markAllNotificationsRead);
router.put("/notifications/:id/read", protect, authorizeRoles("student", "instructor"), rh.markNotificationRead);

export default router;
