const express = require("express");
const { superAdminAuth } = require("../middleware/auth");
const {
  addStudentSingle,
  addStudentExcel,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const multer = require("multer");
// use memory storage so req.file.buffer exists
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/single", addStudentSingle);
router.post("/excel-upload", upload.single("excel"), addStudentExcel);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
