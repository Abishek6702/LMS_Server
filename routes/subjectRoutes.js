const express = require('express');
const { superAdminAuth } = require('../middleware/auth');
const {
  addSubjectSingle,
  addSubjectsMultiple,
  getAllSubjects, getSubjectById,
  updateSubject,
  deleteSubject,
  filterSubjects,
  // allocateSemesterToSubjects,
  allocateSemesterFull
} = require('../controllers/subjectController');
const { parseSubjectExcel } = require("../services/excelParser");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/single', addSubjectSingle);
router.post("/excel-upload", upload.single("excel"), addSubjectsMultiple);
router.get('/', getAllSubjects);
// semester allocation edit unchek not worked
// router.post("/allocate-semester", allocateSemesterToSubjects);
router.post("/allocate-semester-full", allocateSemesterFull);
router.get("/filter", filterSubjects); 
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
