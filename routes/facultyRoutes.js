const express = require("express");
const {
  addFacultySingle,
  addFacultyExcel,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/facultyController");
const multer = require("multer");

// use memory storage so req.file.buffer exists
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/single", addFacultySingle);
router.post("/excel-upload", upload.single("excel"), addFacultyExcel);
router.get("/", getAllFaculty);
router.get("/:id", getFacultyById);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

module.exports = router;
